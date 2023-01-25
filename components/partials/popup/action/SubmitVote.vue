<template>
  <PartialsPopup require-button>
    <template #header>
      <h2>
        <client-only>
          <template v-if="ACTION_SUBMITVOTE.tx.hash">
            Your vote has been submitted!
          </template>
          <template v-else-if="ACTION_SUBMITVOTE.isLoading || ACTION_SUBMITVOTE.isWaiting">
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
          v-if="ACTION_SUBMITVOTE.tx.hash"
          key="success"
          class="grid gap-20 typo-paragraph"
        >
          <span>
            Congratulations! The vote has been submitted.
          </span>
          <ControlsButtonAction @click="closePopup">
            Close
          </ControlsButtonAction>
        </div>
        <!-- LOADING -->
        <div
          v-else-if="ACTION_SUBMITVOTE.isLoading || ACTION_SUBMITVOTE.isWaiting"
          key="loading"
          class="grid gap-20 typo-paragraph"
        >
          <span>
            Your vote is being submitted. Please wait for few seconds.
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
import { useProposalsStore } from '@/stores/proposals'
import { useUserStore } from '@/stores/user'

const { IconConverter, IconBuilder } = IconService
const { CallTransactionBuilder } = IconBuilder

type Props = {
  uid: string
  vote?: string
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
const route = useRoute()
const uid = route?.params?.uid

const { emit, bus, events } = useEventsBus()
const { getBlockData, getTxResult, getStepLimit } = useScoreService()
const { notify } = useNotificationToast()
const { ICONEX_HANDLE_CANCEL } = useIconexListener()

const { dipsatchLedger } = useLedgerStore()
const { fetchProposal } = useProposalsStore()
const { address, wallet } = storeToRefs(useUserStore())

const nid = iconNetwork === 'testnet' ? '83' : '1'

const isGlobalListening = ref<boolean>(false)
const ACTION_SUBMITVOTE = reactive<ActionData>({
  type: 'RPC',
  tx: {},
  query: {},
  isListening: false,
  isWaiting: false,
  isLoading: false,
  isSuccess: false,
})

const paramsState = {
  _proposalId: props.uid,
  _vote: props.vote,
}

const getSubmitVoteQuery = async (): Promise<Query> => {
  try {
    const stepLimit = await getStepLimit(
      address.value,
      'vote',
      scoreAddress,
      paramsState,
    )

    const tx = new CallTransactionBuilder()
      .from(address.value)
      .to(scoreAddress)
      .stepLimit(stepLimit)
      .nid(IconConverter.toBigNumber(nid))
      .nonce(IconConverter.toBigNumber('1'))
      .version(IconConverter.toBigNumber('3'))
      .timestamp((new Date()).getTime() * 1000)
      .method('vote')
      .params(paramsState)
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

const makeSubmitVoteQuery = async (hash: string): Promise<{ block: BlockData, tx: { txHash: string } }> => new Promise((resolve, reject) => {
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
        resolve(makeSubmitVoteQuery(hash))
      }, 2000)
    })
})

const RESET_SUBMITVOTE = (): void => {
  ACTION_SUBMITVOTE.tx = {}
  ACTION_SUBMITVOTE.query = {}
  ACTION_SUBMITVOTE.isListening = false
  ACTION_SUBMITVOTE.isWaiting = false
  ACTION_SUBMITVOTE.isLoading = false
  ACTION_SUBMITVOTE.isSuccess = false
}

const RESET_LISTENER = (): void => {
  isGlobalListening.value = false
  RESET_SUBMITVOTE()
}

const CALLBACK_SUBMITVOTE = async (hash: string): void => {
  try {
    RESET_SUBMITVOTE()
    ACTION_SUBMITVOTE.tx = { hash }
    ACTION_SUBMITVOTE.isSuccess = true

    if (typeof uid === 'string') {
      await fetchProposal(uid)
    }
  } catch (error) {
    notify.error({
      title: 'Error',
      message: error,
      timeout: 5000,
    })
  }
}

const COMPLETE_SUBMITVOTE = async (hash: string): Promise<void> => {
  try {
    ACTION_SUBMITVOTE.isWaiting = false
    ACTION_SUBMITVOTE.isLoading = true
    const { tx } = await makeSubmitVoteQuery(hash)
    CALLBACK_SUBMITVOTE(tx.txHash)
  } catch (error) {
    RESET_SUBMITVOTE()

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
    if (ACTION_SUBMITVOTE.type === 'RPC' && ACTION_SUBMITVOTE.isListening) {
      ACTION_SUBMITVOTE.isListening = false
      await COMPLETE_SUBMITVOTE(result)
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

const DISPATCH_SUBMITVOTE = async (): Promise<void> => {
  ACTION_SUBMITVOTE.query = {
    address: address.value,
    score: scoreAddress,
    params: paramsState,
  }

  const query = await getSubmitVoteQuery()

  isGlobalListening.value = true
  ACTION_SUBMITVOTE.isWaiting = true
  ACTION_SUBMITVOTE.isListening = true

  TX_ROUTER({ type: 'REQUEST_JSON-RPC', payload: query })
}

const closePopup = (): void => {
  RESET_SUBMITVOTE()
  emit(events.POPUP_CLOSE)
}

watch(() => bus.value.get(events.ICONEX_CANCEL), () => {
  RESET_LISTENER()
  ICONEX_HANDLE_CANCEL({ error: 'Cancelled' })
})

watch(() => bus.value.get(events.ICONEX_RPC), HANDLE_RPC)

onMounted(async () => {
  await DISPATCH_SUBMITVOTE()
})
</script>
