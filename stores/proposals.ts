import axios from 'axios'
import { defineStore, storeToRefs } from 'pinia'
import { useUserStore } from './user'

type Proposal = {
  uid: string
  endTime: number
  discussion: string
  title: string
  description: string
  creator: string
  status: 'Active' | 'Closed'
  votes: {
    for: number
    against: number
    abstain: number
  }
}

type ProposalsList = {
  [key in string]: Proposal
}

type VoteValue = keyof Proposal['votes']

type ProposalScore = {
  _proposalId: string
  _creator: string
  _status: Proposal['status']
  _abstainVoices: string
  _forVoices: string
  _againstVoices: string
  _endTime: string
  _ipfsHash: string
}

type ProposalIpfs = {
  title: string
  description: string
  discussion: string
}

type UserVotes = {
  [id in string]: VoteValue
}

const getIpfs = (hash: string): string => `https://craft-network.mypinata.cloud/ipfs/${hash}`

export const useProposalsStore = defineStore('proposals-store', () => {
  const { address } = storeToRefs(useUserStore())
  const { SCORECallReadOnly } = useScoreService()
  const route = useRoute()

  // States
  const isAllFetched = ref<boolean>(false)
  const proposals = reactive<ProposalsList>({})
  const userVotes = ref<UserVotes>({})

  // Getters
  const currentProposal = computed<Proposal>(() => {
    if (route.name === 'proposal-uid' && typeof route.params.uid === 'string') return proposals[route.params.uid]
    return null
  })

  // Actions
  const fetchProposal = async (uid: string): Promise<void> => {
    try {
      if (!proposals[uid]) {
        const {
          _ipfsHash,
          _proposalId,
          _endTime,
          _creator,
          _status,
          _forVoices,
          _againstVoices,
          _abstainVoices,
        } = await SCORECallReadOnly<ProposalScore>('getProposal', { _proposalId: uid })
        const {
          title = '',
          description = '',
          discussion = '',
        } = await axios.get<ProposalIpfs>(getIpfs(_ipfsHash)).then(({ data }) => data)

        proposals[_proposalId] = {
          uid: _proposalId,
          endTime: parseInt(_endTime, 16) / 1000,
          discussion,
          title,
          description,
          creator: _creator,
          status: _status,
          votes: {
            for: parseInt(_forVoices, 16) / (10 ** 18),
            against: parseInt(_againstVoices, 16) / (10 ** 18),
            abstain: parseInt(_abstainVoices, 16) / (10 ** 18),
          },
        }
      }

      if (address.value && !userVotes.value[currentProposal.value.uid]) {
        const currentUserVote = await SCORECallReadOnly<{ _power: string, _vote: VoteValue }>('getVote', { _voter: address.value, _proposalId: currentProposal.value.uid })

        if (currentUserVote) {
          userVotes.value[currentProposal.value.uid] = currentUserVote._vote
        }
      }
    } catch (error) {
      throw new Error(error)
    }
  }
  const fetchProposals = async (): Promise<void> => {
    try {
      const lastId = parseInt(await SCORECallReadOnly<string>('lastProposalId'), 16)
      const dataFromScore = await Promise.all([...new Array(lastId)].map((_, index) => SCORECallReadOnly<ProposalScore>('getProposal', { _proposalId: `0x${parseFloat(`${index + 1}`).toString(16)}` })))
      const dataFromIpfs = await Promise.all(dataFromScore.map(({ _ipfsHash }) => axios.get<ProposalIpfs>(getIpfs(_ipfsHash)).then(({ data }) => data)))

      dataFromScore.forEach(({
        _proposalId,
        _endTime,
        _creator,
        _status,
        _forVoices,
        _againstVoices,
        _abstainVoices,
      }, index) => {
        proposals[_proposalId] = {
          uid: _proposalId,
          endTime: parseInt(_endTime, 16) / 1000,
          discussion: dataFromIpfs[index].discussion || '',
          title: dataFromIpfs[index].title || '',
          description: dataFromIpfs[index].description || '',
          creator: _creator,
          status: _status,
          votes: {
            for: parseInt(_forVoices, 16) / (10 ** 18),
            against: parseInt(_againstVoices, 16) / (10 ** 18),
            abstain: parseInt(_abstainVoices, 16) / (10 ** 18),
          },
        }
      })
    } catch (error) {
      throw new Error(error)
    } finally {
      isAllFetched.value = true
    }
  }

  return {
    // States
    isAllFetched,
    proposals,
    userVotes,

    // Getters
    currentProposal,

    // Actions
    fetchProposal,
    fetchProposals,
  }
})
