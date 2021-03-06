import { valuesFor } from '../../helpers/utils/util'
import abi from 'human-standard-token-abi'
import { multiplyCurrencies } from '../../helpers/utils/conversion-util'
import { getMetaMaskAccounts, getSelectedAddress, getAddressBook } from '../../selectors/selectors'
import { estimateGasPriceFromRecentBlocks, calcGasTotal } from './send.utils'
import {
  getAveragePriceEstimateInHexWEI,
} from '../../selectors/custom-gas'

export function accountsWithSendEtherInfoSelector (state) {
  const accounts = getMetaMaskAccounts(state)
  const { identities } = state.metamask
  const accountsWithSendEtherInfo = Object.entries(accounts).map(([key, account]) => {
    return Object.assign({}, account, identities[key])
  })

  return accountsWithSendEtherInfo
}

export function getAmountConversionRate (state) {
  return getSelectedToken(state)
    ? getSelectedTokenToFiatRate(state)
    : getConversionRate(state)
}

export function getBlockGasLimit (state) {
  return state.metamask.currentBlockGasLimit
}

export function getConversionRate (state) {
  return state.metamask.conversionRate
}

export function getCurrentAccountWithSendEtherInfo (state) {
  const currentAddress = getSelectedAddress(state)
  const accounts = accountsWithSendEtherInfoSelector(state)

  return accounts.find(({ address }) => address === currentAddress)
}

export function getCurrentCurrency (state) {
  return state.metamask.currentCurrency
}

export function getNativeCurrency (state) {
  return state.metamask.nativeCurrency
}

export function getCurrentNetwork (state) {
  return state.metamask.network
}

export function getForceGasMin (state) {
  return state.metamask.send.forceGasMin
}

export function getGasLimit (state) {
  return state.metamask.send.gasLimit || '0'
}

export function getGasPrice (state) {
  return state.metamask.send.gasPrice || getAveragePriceEstimateInHexWEI(state)
}

export function getGasPriceFromRecentBlocks (state) {
  return estimateGasPriceFromRecentBlocks(state.metamask.recentBlocks)
}

export function getGasTotal (state) {
  return calcGasTotal(getGasLimit(state), getGasPrice(state))
}

export function getPrimaryCurrency (state) {
  const selectedToken = getSelectedToken(state)
  return selectedToken && selectedToken.symbol
}

export function getRecentBlocks (state) {
  return state.metamask.recentBlocks
}

export function getSelectedAccount (state) {
  const accounts = getMetaMaskAccounts(state)
  const selectedAddress = getSelectedAddress(state)

  return accounts[selectedAddress]
}

export function getSelectedIdentity (state) {
  const selectedAddress = getSelectedAddress(state)
  const identities = state.metamask.identities

  return identities[selectedAddress]
}

export function getSelectedToken (state) {
  const tokens = state.metamask.tokens || []
  const selectedTokenAddress = state.metamask.selectedTokenAddress
  const selectedToken = tokens.filter(({ address }) => address === selectedTokenAddress)[0]
  const sendToken = state.metamask.send.token

  return selectedToken || sendToken || null
}

export function getSelectedTokenContract (state) {
  const selectedToken = getSelectedToken(state)

  return selectedToken
    ? global.eth.contract(abi).at(selectedToken.address)
    : null
}

export function getSelectedTokenExchangeRate (state) {
  const tokenExchangeRates = state.metamask.tokenExchangeRates
  const selectedToken = getSelectedToken(state) || {}
  const { symbol = '' } = selectedToken
  const pair = `${symbol.toLowerCase()}_eth`
  const { rate: tokenExchangeRate = 0 } = tokenExchangeRates && tokenExchangeRates[pair] || {}

  return tokenExchangeRate
}

export function getSelectedTokenToFiatRate (state) {
  const selectedTokenExchangeRate = getSelectedTokenExchangeRate(state)
  const conversionRate = getConversionRate(state)

  const tokenToFiatRate = multiplyCurrencies(
    conversionRate,
    selectedTokenExchangeRate,
    { toNumericBase: 'dec' }
  )

  return tokenToFiatRate
}

export function getSendAmount (state) {
  return state.metamask.send.amount
}

export function getSendHexData (state) {
  return state.metamask.send.data
}

export function getSendHexDataFeatureFlagState (state) {
  return state.metamask.featureFlags.sendHexData
}

export function getSendEditingTransactionId (state) {
  return state.metamask.send.editingTransactionId
}

export function getSendErrors (state) {
  return state.send.errors
}

export function getSendFrom (state) {
  return state.metamask.send.from
}

export function getSendFromBalance (state) {
  const from = getSendFrom(state) || getSelectedAccount(state)
  return from.balance
}

export function getSendFromObject (state) {
  return getSendFrom(state) || getCurrentAccountWithSendEtherInfo(state)
}

export function getSendMaxModeState (state) {
  return state.metamask.send.maxModeOn
}

export function getSendTo (state) {
  return state.metamask.send.to
}

export function getSendToNickname (state) {
  return state.metamask.send.toNickname
}

export function getSendToAccounts (state) {
  const fromAccounts = accountsWithSendEtherInfoSelector(state)
  const addressBookAccounts = getAddressBook(state)
  return [...fromAccounts, ...addressBookAccounts]
}
export function getTokenBalance (state) {
  return state.metamask.send.tokenBalance
}

export function getSendEnsResolution (state) {
  return state.metamask.send.ensResolution
}

export function getSendEnsResolutionError (state) {
  return state.metamask.send.ensResolutionError
}

export function getTokenExchangeRate (state, tokenSymbol) {
  const pair = `${tokenSymbol.toLowerCase()}_eth`
  const tokenExchangeRates = state.metamask.tokenExchangeRates
  const { rate: tokenExchangeRate = 0 } = tokenExchangeRates[pair] || {}

  return tokenExchangeRate
}

export function getUnapprovedTxs (state) {
  return state.metamask.unapprovedTxs
}

export function transactionsSelector (state) {
  const { network, selectedTokenAddress } = state.metamask
  const unapprovedMsgs = valuesFor(state.metamask.unapprovedMsgs)
  const shapeShiftTxList = (network === '1') ? state.metamask.shapeShiftTxList : undefined
  const transactions = state.metamask.selectedAddressTxList || []
  const txsToRender = !shapeShiftTxList ? transactions.concat(unapprovedMsgs) : transactions.concat(unapprovedMsgs, shapeShiftTxList)

  return selectedTokenAddress
    ? txsToRender
      .filter(({ txParams }) => txParams && txParams.to === selectedTokenAddress)
      .sort((a, b) => b.time - a.time)
    : txsToRender
      .sort((a, b) => b.time - a.time)
}

export function getQrCodeData (state) {
  return state.appState.qrCodeData
}
