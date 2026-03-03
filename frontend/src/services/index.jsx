import { ApiClient } from './api-client'
import { UserService } from './user-service'
import { IdeaService } from './idea-service'
import { VotingService } from './voting-service'
import { GamificationService } from './gamification-service'

// Create API client instance
const apiClient = new ApiClient()

// Create service instances
export const userService = new UserService(apiClient)
export const ideaService = new IdeaService(apiClient)
export const votingService = new VotingService(apiClient)
export const gamificationService = new GamificationService(apiClient)

// Export API client for direct use
export const api = apiClient

// Export default object with all services
export default {
  api: apiClient,
  users: userService,
  ideas: ideaService,
  voting: votingService,
  gamification: gamificationService
}
