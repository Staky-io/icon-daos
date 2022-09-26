import { defineStore } from 'pinia'

import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
import IconService from 'icon-sdk-js'
import Icx from '@/assets/scripts/libs/hw-app-icx/Icx'

import { useUserStore } from '@/stores/user'

const { iconNetwork } = useRuntimeConfig()
const isTestnet = iconNetwork === 'testnet'
const url = isTestnet ? 'https://sejong.net.solidwallet.io/' : 'https://ctz.solidwallet.io/'
const provider = new IconService.HttpProvider(`${url}api/v3`)
const iconService = new IconService(provider)

type LedgerStatus = {
  isFetching: boolean
  currentPage: number
  error: string | null
}

type LedgerAddressData = {
  id: number
  address: string
  balance: number
  path: string
  isLoading: boolean
}

type LedgerAddressesList = LedgerAddressData[]

export const useLedgerStore = defineStore('ledger-store', () => {
  const { emit, events } = useEventsBus()
  const { notify } = useNotificationToast()
  const { loginUser } = useUserStore()
  const ITEMS_PER_PAGE = 5 as const

  // States
  const addressPath = ref<string>('')
  const ledgerAddresses = ref<LedgerAddressesList>([])
  const ledgerStatus = reactive<LedgerStatus>({
    isFetching: true,
    currentPage: 0,
    error: '',
  })

  // Actions
  const getLedgerAddresses = async (page: number): Promise<LedgerAddressesList> => {
    try {
      const transport = await TransportWebUSB.create()
      const icx = new Icx(transport)

      const ledgerBook: LedgerAddressesList = []
      for (let index = (ITEMS_PER_PAGE * page); index < ((ITEMS_PER_PAGE * page) + ITEMS_PER_PAGE); index++) {
        // eslint-disable-next-line no-await-in-loop
        const { address } = await icx.getAddress(`44'/4801368'/0'/0'/${index}'`)
        // eslint-disable-next-line no-await-in-loop
        const result = await iconService.getBalance(String(address)).execute()
        const balance = IconService.IconConverter.toNumber(result) / 10 ** 18
        ledgerBook.push({
          id: index,
          address: String(address),
          path: `44'/4801368'/0'/0'/${index}'`,
          balance,
          isLoading: false,
        })
      }

      return ledgerBook
    } catch (error) {
      throw new Error(error)
    }
  }
  const selectLedgerAddress = async <A extends LedgerAddressData>(address: A['address'], path: A['path']): Promise<void> => {
    const currentLedgerAddress = ledgerAddresses.value.find((ledgerAddress) => ledgerAddress.address === address)
    currentLedgerAddress.isLoading = true

    try {
      addressPath.value = path
      loginUser({ address, wallet: 'ledger' })
      emit(events.POPUP_CLOSE, { handlePending: true })
      notify.success({
        title: 'Log in successful',
        timeout: 5000,
      })
    } catch (error) {
      notify.error({
        title: 'Error',
        message: error,
        timeout: 5000,
      })
    } finally {
      currentLedgerAddress.isLoading = false
    }
  }
  const setLedgerPage = async (page: number): Promise<void> => {
    ledgerStatus.isFetching = true
    ledgerStatus.error = ''

    getLedgerAddresses(page)
      .then((result) => {
        ledgerAddresses.value = result
        ledgerStatus.currentPage = page
      })
      .catch((error) => {
        const stringError = String(error)
        let message = stringError
        if (stringError.includes('TransportOpenUserCancelled')) message = 'Ledger connection canceled.'
        else if (stringError.includes('TransportError')) message = 'Something wrong happened. Please retry later.'
        ledgerStatus.error = message
        notify.error({
          title: 'Error',
          message,
          timeout: 5000,
        })
      })
      .finally(() => {
        ledgerStatus.isFetching = false
      })
  }

  return {
    // States
    addressPath,
    ledgerAddresses,
    ledgerStatus,

    // Actions
    selectLedgerAddress,
    setLedgerPage,
  }
}, { persist: true })
