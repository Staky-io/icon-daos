<template>
  <PartialsPopup require-button>
    <template #header>
      <h2>
        <client-only>
          <template v-if="ACTION_SUBMITPROPOSAL.tx.hash">
            Your proposal has been submitted!
          </template>
          <template v-else-if="ACTION_SUBMITPROPOSAL.isLoading || ACTION_SUBMITPROPOSAL.isWaiting">
            Submitting...
          </template>
        </client-only>
      </h2>
    </template>
    <template #body>
      <transition
        name="fade-bounce"
        mode="out-in"
      >
        <!-- SUCCESS -->
        <div
          v-if="ACTION_SUBMITPROPOSAL.tx.hash"
          key="success"
          class="grid gap-20 typo-paragraph"
        >
          <span>
            Congratulations! The proposal has been submitted.
          </span>
          <ControlsButtonAction @click="closePopup">
            Close
          </ControlsButtonAction>
        </div>
        <!-- LOADING -->
        <div
          v-else-if="ACTION_SUBMITPROPOSAL.isLoading || ACTION_SUBMITPROPOSAL.isWaiting"
          key="loading"
          class="grid gap-20 typo-paragraph"
        >
          <span>
            Your proposal is being submitted. Please wait for few seconds.
          </span>
        </div>
      </transition>
    </template>
  </PartialsPopup>
</template>

<script setup lang="ts">
import IconService from 'icon-sdk-js'
import { storeToRefs } from 'pinia'
import type { BlockData } from '@/composables/useScoreService'
import { useLedgerStore } from '@/stores/ledger'
import { useUserStore } from '@/stores/user'
import axios from 'axios'

const { IconConverter, IconBuilder } = IconService
const { CallTransactionBuilder } = IconBuilder

type Props = {
  title: string
  description: string
  discussion?: string
  expiration: string
}

type ActionData = {
  type: string
  tx: Record<string, unknown>
  query: Record<string, unknown>
  isListening: boolean
  isWaiting: boolean
  isLoading: boolean
  isSuccess: boolean
}

type Query = {
  jsonrpc: string
  method: string
  params: ReturnType<typeof IconConverter.toRawTransaction>
  id: number
}

const props = defineProps<Props>()

const { iconNetwork, scoreAddress } = useRuntimeConfig()

const { emit, bus, events } = useEventsBus()
const { getBlockData, getTxResult, getStepLimit } = useScoreService()
const { notify } = useNotificationToast()
const { ICONEX_HANDLE_CANCEL } = useIconexListener()

const { dipsatchLedger } = useLedgerStore()
const { address, wallet } = storeToRefs(useUserStore())

const nid = iconNetwork === 'testnet' ? '83' : '1'

const isGlobalListening = ref<boolean>(false)
const ACTION_SUBMITPROPOSAL = reactive<ActionData>({
  type: 'RPC',
  tx: {},
  query: {},
  isListening: false,
  isWaiting: false,
  isLoading: false,
  isSuccess: false,
})

let expirationState = 0
switch (props.expiration) {
  case '3 days':
    expirationState = (new Date(Date.now()).getTime() + 1000 * 60 * 60 * 24 * 3) * 1000
    break
  case '7 days':
    expirationState = (new Date(Date.now()).getTime() + 1000 * 60 * 60 * 24 * 7) * 1000
    break
  case '14 days':
    expirationState = (new Date(Date.now()).getTime() + 1000 * 60 * 60 * 24 * 14) * 1000
    break
  default:
    expirationState = (new Date(Date.now()).getTime() + 1000 * 60 * 60 * 24 * 14) * 1000
    break
}

const paramsState = {
  title: props.title,
  description: props.description,
  discussion: props.discussion || '',
}

const getSubmitProposalQuery = async (): Promise<Query> => {
  try {
    const url = new URL('https://utils.craft.network/agoraPin')
    url.searchParams.set('title', paramsState.title)
    url.searchParams.set('description', paramsState.description)
    if (paramsState.discussion) url.searchParams.set('discussion', paramsState.discussion)

    const ipfsHash = await axios(url.href).then<string>((response) => response.data)

    const methodParams = {
      _ipfsHash: ipfsHash,
      _endTime: expirationState.toString(),
    }

    const stepLimit = await getStepLimit(
      address.value,
      'submitProposal',
      scoreAddress,
      methodParams,
    )

    const tx = new CallTransactionBuilder()
      .from(address.value)
      .to(scoreAddress)
      .stepLimit(stepLimit)
      .nid(IconConverter.toBigNumber(nid))
      .nonce(IconConverter.toBigNumber('1'))
      .version(IconConverter.toBigNumber('3'))
      .timestamp((new Date()).getTime() * 1000)
      .method('submitProposal')
      .params(methodParams)
      .build()

    return {
      jsonrpc: '2.0',
      method: 'icx_sendTransaction',
      params: IconConverter.toRawTransaction(tx),
      id: 1198,
    }
  } catch (error) {
    notify.error({
      title: 'Error',
      message: error,
      timeout: 5000,
    })
    return null
  }
}

const makeSubmitProposalQuery = async (hash: string): Promise<{ block: BlockData, tx: { txHash: string } }> => new Promise((resolve, reject) => {
  getTxResult(hash)
    .then((tx) => {
      if (tx.status === 1) {
        getBlockData(tx.blockHash)
          .then((block) => {
            resolve({ block, tx })
          })
      } else {
        reject(tx.failure)
      }
    })
    .catch(() => {
      setTimeout(() => {
        resolve(makeSubmitProposalQuery(hash))
      }, 2000)
    })
})

const RESET_SUBMITPROPOSAL = (): void => {
  ACTION_SUBMITPROPOSAL.tx = {}
  ACTION_SUBMITPROPOSAL.query = {}
  ACTION_SUBMITPROPOSAL.isListening = false
  ACTION_SUBMITPROPOSAL.isWaiting = false
  ACTION_SUBMITPROPOSAL.isLoading = false
  ACTION_SUBMITPROPOSAL.isSuccess = false
}

const RESET_LISTENER = (): void => {
  isGlobalListening.value = false
  RESET_SUBMITPROPOSAL()
}

const CALLBACK_SUBMITPROPOSAL = (hash: string): void => {
  try {
    RESET_SUBMITPROPOSAL()
    ACTION_SUBMITPROPOSAL.tx = { hash }
    ACTION_SUBMITPROPOSAL.isSuccess = true
  } catch (error) {
    notify.error({
      title: 'Error',
      message: error,
      timeout: 5000,
    })
  }
}

const COMPLETE_SUBMITPROPOSAL = async (hash: string): Promise<void> => {
  try {
    ACTION_SUBMITPROPOSAL.isWaiting = false
    ACTION_SUBMITPROPOSAL.isLoading = true
    const { tx } = await makeSubmitProposalQuery(hash)
    CALLBACK_SUBMITPROPOSAL(tx.txHash)
  } catch (error) {
    RESET_SUBMITPROPOSAL()

    notify.error({
      title: 'Error',
      message: error,
      timeout: 5000,
    })
  }
}

const HANDLE_RPC = async (payload): Promise<void> => {
  const { error, result } = payload.payload
  if (error) {
    RESET_LISTENER()

    notify.error({
      title: 'Error',
      message: error.message,
      timeout: 5000,
    })
  } else if (result) {
    isGlobalListening.value = false
    if (ACTION_SUBMITPROPOSAL.type === 'RPC' && ACTION_SUBMITPROPOSAL.isListening) {
      ACTION_SUBMITPROPOSAL.isListening = false
      await COMPLETE_SUBMITPROPOSAL(result)
    }
  }
}

const HANDLE_SIGN = ({ error = '', payload }): void => {
  if (error) {
    RESET_LISTENER()

    notify.error({
      title: 'Error',
      message: error,
      timeout: 5000,
    })
  } else if (payload) {
    isGlobalListening.value = false
  }
}

const TX_ROUTER = async ({ type, payload }: { type: string, payload: Query }): Promise<void> => {
  if (!wallet.value || wallet.value === 'iconex') {
    window.dispatchEvent(new CustomEvent('ICONEX_RELAY_REQUEST', {
      detail: { type, payload },
    }))
  } else if (wallet.value === 'ledger') {
    try {
      const result = await dipsatchLedger({ type, payload })
      if (type === 'REQUEST_JSON-RPC') {
        HANDLE_RPC({ payload: { result } })
      } else {
        HANDLE_SIGN({ payload: { result } })
      }
    } catch (error) {
      HANDLE_RPC({ payload: { error: error.message } })

      notify.error({
        title: 'Error',
        message: error.message,
        timeout: 5000,
      })
    }
  }
}

const DISPATCH_SUBMITPROPOSAL = async (): Promise<void> => {
  ACTION_SUBMITPROPOSAL.query = {
    address: address.value,
    score: scoreAddress,
    params: paramsState,
  }

  const query = await getSubmitProposalQuery()

  isGlobalListening.value = true
  ACTION_SUBMITPROPOSAL.isWaiting = true
  ACTION_SUBMITPROPOSAL.isListening = true

  TX_ROUTER({ type: 'REQUEST_JSON-RPC', payload: query })
}

const closePopup = (): void => {
  if (ACTION_SUBMITPROPOSAL.isSuccess) {
    navigateTo('/')
  }
  RESET_SUBMITPROPOSAL()
  emit(events.POPUP_CLOSE)
}

watch(() => bus.value.get(events.ICONEX_CANCEL), () => {
  RESET_LISTENER()
  ICONEX_HANDLE_CANCEL({ error: 'Cancelled' })
})

watch(() => bus.value.get(events.ICONEX_RPC), HANDLE_RPC)

onMounted(async () => {
  await DISPATCH_SUBMITPROPOSAL()
})
</script>
