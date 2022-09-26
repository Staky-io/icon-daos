<template>
  <PartialsPopup>
    <template #header>
      Log in
    </template>
    <template #body>
      <transition
        name="fade-bounce"
        mode="out-in"
      >
        <div
          v-if="currentStep === LOGIN_STEPS.PICK"
          :key="LOGIN_STEPS.PICK"
          class="grid gap-10"
        >
          <div v-if="!compatibleWallets.length">
            Sorry, this browser is not supported at the moment.
            <br>
            Please use Google Chrome / Brave on desktop, or MyIconWallet app on mobile.
          </div>
          <button
            v-for="(wallet, i) in compatibleWallets"
            v-else
            :key="`wallet-${i}`"
            @click="connectWallet(wallet.id)"
          >
            {{ wallet.name }}
          </button>
        </div>
        <div
          v-else-if="currentStep === LOGIN_STEPS.LEDGER"
          key="ledger"
        >
          <button @click="currentStep = LOGIN_STEPS.PICK">
            Return
          </button>
          <transition
            name="fade-bounce"
            mode="out-in"
          >
            <div
              v-if="!ledgerStatus.isFetching && ledgerAddresses.length"
              key="table"
            >
              <table>
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Address</th>
                    <th>Balance</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="({ id, address, balance, path, isLoading }, i) in ledgerAddresses"
                    :key="`address-${i}`"
                  >
                    <td class="pr-20">
                      {{ id }}
                    </td>
                    <td class="px-20">
                      {{ truncate({ string: address, start: 12, end: 16 }) }}
                    </td>
                    <td class="px-20">
                      {{ formatValue({ value: balance, hasSNA: true, suffix: 'ICX' }) }}
                    </td>
                    <td class="pl-20">
                      <button @click="selectLedgerAddress(address, path)">
                        Select
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div>
                <button
                  v-for="page in 9"
                  :key="`paginationButton-${page}`"
                  @click="setLedgerPage(page - 1)"
                >
                  {{ page }}
                </button>
              </div>
            </div>
            <div
              v-else-if="!ledgerStatus.error"
              key="loading"
            >
              Select a Ledger address. <UtilsLoader />
            </div>
            <div
              v-else
              key="error"
            >
              {{ ledgerStatus.error }}
            </div>
          </transition>
        </div>
      </transition>
    </template>
  </PartialsPopup>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useDeviceStore } from '@/stores/device'
import { useLedgerStore } from '@/stores/ledger'
import { formatValue, truncate } from '@/assets/scripts/helpers'

const isNonDesktopWarned = useState<boolean>('isNonDesktopWarned', () => false)

const ledgerStore = useLedgerStore()
const { selectLedgerAddress, setLedgerPage } = ledgerStore
const { ledgerAddresses, ledgerStatus } = storeToRefs(ledgerStore)
const { browser, device } = useDeviceStore()

const { bus, events } = useEventsBus()
const { notify } = useNotificationToast()
const {
  ICONEX_HANDLE_ACCOUNT,
  ICONEX_HANDLE_ADDRESS,
  ICONEX_HANDLE_CANCEL,
} = useIconexListener()

enum LOGIN_STEPS {
  PICK = 'pick',
  LEDGER = 'ledger',
}

enum WALLET_IDS {
  ICONEX = 'iconex',
  LEDGER = 'ledger',
  MYICONWALLET = 'myiconwallet',
}

type WalletData = {
  id: WALLET_IDS
  name: string
  compatibility: string[]
  isAvailable: boolean
}

type WalletsList = WalletData[]

const currentStep = ref<LOGIN_STEPS>(LOGIN_STEPS.PICK)
const walletsList = ref<WalletsList>([
  {
    id: WALLET_IDS.ICONEX,
    name: 'ICONex/Hana',
    compatibility: ['chrome'],
    isAvailable: false,
  },
  {
    id: WALLET_IDS.LEDGER,
    name: 'Ledger',
    compatibility: ['chrome'],
    isAvailable: false,
  },
  {
    id: WALLET_IDS.MYICONWALLET,
    name: 'MyICONWallet app',
    compatibility: ['mobile'],
    isAvailable: false,
  },
])

const compatibleWallets = computed<WalletsList>(
  () => walletsList.value
    .filter((wallet) => wallet.compatibility.includes(device.isDesktop ? browser : 'mobile'))
    .map((wallet) => ({ ...wallet, isAvailable: true })),
)

const connectIconex = (): void => {
  window.dispatchEvent(new CustomEvent('ICONEX_RELAY_REQUEST', {
    detail: { type: 'REQUEST_HAS_ACCOUNT' },
  }))
}

const connectLedger = (): void => {
  setLedgerPage(0)
}

const connectWallet = (id: WALLET_IDS): void => {
  if (['ledger'].includes(id)) currentStep.value = LOGIN_STEPS.LEDGER

  switch (id) {
    case 'iconex':
      connectIconex()
      break
    case 'ledger':
      connectLedger()
      break
    case 'myiconwallet':
      //
      break
    // no default
  }
}

watch(() => bus.value.get(events.ICONEX_ACCOUNT), ICONEX_HANDLE_ACCOUNT)
watch(() => bus.value.get(events.ICONEX_ADDRESS), ICONEX_HANDLE_ADDRESS)
watch(() => bus.value.get(events.ICONEX_CANCEL), ICONEX_HANDLE_CANCEL)

onMounted(async () => {
  await nextTick()

  if (device.isDesktop && !isNonDesktopWarned.value) {
    isNonDesktopWarned.value = true

    notify.info({
      title: 'App on mobile',
      message: 'To use the app on Mobile, you have to download the MyICONWallet app and browse to this url with it.',
      timeout: 10000,
    })
  }
})
</script>
