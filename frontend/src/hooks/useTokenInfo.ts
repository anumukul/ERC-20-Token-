import { useReadContract } from 'wagmi'
import { CONTRACT_ADDRESS, ERC20_ABI } from '../contracts/contractConfig'

export const useTokenInfo = () => {
  const { data: name } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'name',
  })

  const { data: symbol } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'symbol',
  })

  const { data: decimals } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'decimals',
  })

  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'totalSupply',
  })

  return {
    tokenInfo: {
      name: name as string,
      symbol: symbol as string,
      decimals: decimals as number,
      totalSupply: totalSupply as bigint,
    },
    isLoading: !name || !symbol || !decimals || !totalSupply
  }
}