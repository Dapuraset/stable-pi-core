// ggf.js - Galactic Governance Framework

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');

class GalacticGovernanceFramework extends EventEmitter {
    constructor() {
        super();
        this.proposals = [];
        this.votes = [];
        this.entities = new Set(); // Unique set of authorized entities
        this.logger = this.createLogger();
    }

    // Create a logger for logging events
    createLogger() {
        return {
            log: (message) => {
                const timestamp = new Date().toISOString();
                console.log(`[${timestamp}] ${message}`);
            }
        };
    }

    // Register a new entity
    registerEntity(entityId) {
        if (!this.entities.has(entityId)) {
            this.entities.add(entityId);
            this.logger.log(`Entity registered: ${entityId}`);
            this.emit('entityRegistered', entityId);
        } else {
            this.logger.log(`Entity already registered: ${entityId}`);
        }
    }

    // Create a new proposal
    createProposal(title, description, proposer) {
        if (!this.entities.has(proposer)) {
            throw new Error('Unauthorized proposer');
        }

        const proposal = {
            id: uuidv4(),
            title,
            description,
            proposer,
            votes: 0,
            status: 'pending',
            timestamp: Date.now(),
        };

        this.proposals.push(proposal);
        this.logger.log(`Proposal created: ${JSON.stringify(proposal)}`);
        this.emit('proposalCreated', proposal);
        return proposal;
    }

    // Vote on a proposal
    voteOnProposal(proposalId, entityId) {
        if (!this.entities.has(entityId)) {
            throw new Error('Unauthorized voter');
        }

        const proposal = this.proposals.find(p => p.id === proposalId);
        if (!proposal) {
            throw new Error('Proposal not found');
        }

        // Check if the entity has already voted
        if (this.votes.find(v => v.proposalId === proposalId && v.entityId === entityId)) {
            throw new Error('Entity has already voted on this proposal');
        }

        proposal.votes += 1;
        this.votes.push({ proposalId, entityId });
        this.logger.log(`Vote cast by ${entityId} on proposal ${proposalId}`);
        this.emit('voteCast', { proposalId, entityId });

        // Check if the proposal has reached a consensus (dynamic quorum)
        const quorum = Math.ceil(this.entities.size / 2); // Simple majority
        if (proposal.votes >= quorum) {
            proposal.status = 'approved';
            this.logger.log(`Proposal approved: ${JSON.stringify(proposal)}`);
            this.emit('proposalApproved', proposal);
        }
    }

    // Get all proposals
    getAllProposals() {
        return this.proposals;
    }

    // Get proposal by ID
    getProposalById(proposalId) {
        return this.proposals.find(p => p.id === proposalId);
    }

    // Get voting results for a proposal
    getVotingResults(proposalId) {
        const proposal = this.getProposalById(proposalId);
        if (!proposal) {
            throw new Error('Proposal not found');
        }
        return {
            proposalId,
            votes: proposal.votes,
            status: proposal.status,
        };
    }

    // Execute a proposal (if applicable)
    executeProposal(proposalId) {
        const proposal = this.getProposalById(proposalId);
        if (!proposal) {
            throw new Error('Proposal not found');
        }
        if (proposal.status !== 'approved') {
            throw new Error('Proposal must be approved before execution');
        }

        // Execute the proposal logic here (this is a placeholder)
        this.logger.log(`Executing proposal: ${JSON.stringify(proposal)}`);
        proposal.status = 'executed';
        this.emit('proposalExecuted', proposal);
    }
}

// Example usage
(async () => {
    const ggf = new GalacticGovernanceFramework();

    // Register entities
    ggf.registerEntity('PlanetA');
    ggf.registerEntity('PlanetB');
    ggf.registerEntity('PlanetC');

    // Create a new proposal
    const proposal = ggf.createProposal('Establish Trade Routes', 'Proposal to establish trade routes between planets.', 'PlanetA');
    console.log('Created proposal:', proposal);

    // Voting on the proposal
    try {
        ggf.voteOnProposal(proposal.id, 'PlanetB');
        ggf.voteOnProposal(proposal.id, 'PlanetC');
    } catch (error) {
        console.error(error.message);
    }

    // Get voting results
    const results = ggf.getVotingResults(proposal.id);
    console.log('Voting results:', results);

    // Execute the proposal if approved
    if (results.status === 'approved') {
        ggf.executeProposal(proposal.id);
        console.log('Proposal executed:', proposal);
    }

    // Retrieve all proposals
    const allProposals = ggf.getAllProposals();
    console.log('All proposals:', allProposals);
})();

module.exports = GalacticGovernanceFramework;
