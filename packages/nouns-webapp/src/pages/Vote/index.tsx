import { Row, Col, Button, Card, ProgressBar, Spinner } from 'react-bootstrap';
import Section from '../../layout/Section';
import {
  ProposalState,
  useCastVote,
  useExecuteProposal,
  useHasVotedOnProposal,
  useProposal,
  useQueueProposal,
  Vote,
} from '../../wrappers/nounsDao';
import { useUserVotesAsOfBlock } from '../../wrappers/nounToken';
import classes from './Vote.module.css';
import { RouteComponentProps } from 'react-router-dom';
import { TransactionStatus, useBlockNumber } from '@usedapp/core';
import { buildEtherscanAddressLink, buildEtherscanTxLink } from '../../utils/etherscan';
import { AlertModal, setAlertModal } from '../../state/slices/application';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advanced from 'dayjs/plugin/advancedFormat';
import VoteModal from '../../components/VoteModal';
import React, { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import clsx from 'clsx';
import ProposalHeader from '../../components/ProposalHeader';
import ProposalContent from '../../components/ProposalContent';
import VoteCard, { VoteCardVariant } from '../../components/VoteCard';
import { useQuery } from '@apollo/client';
import { nounVotesForProposalQuery } from '../../wrappers/subgraph';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advanced);

const AVERAGE_BLOCK_TIME_IN_SECS = 13;

/**
 * Helper function to transform response from graph into flat list of nounIds that voted supportDetailed for the given prop
 *
 * @param data - Graph response for noun vote query
 * @param supportDetailed - The integer support value: against (0), for (1), or abstain (2)
 * @returns - flat list of nounIds that voted supportDetailed for the given prop
 */
 const getNounVotes = (data: any, supportDetailed: number) => {
  return data.proposals[0].votes
    .filter((vote: any) => vote.supportDetailed === supportDetailed)
    .map((vote: any) => vote.nouns)
    .flat(1)
    .map((noun: any) => noun.id);
};

const VotePage = ({
  match: {
    params: { id },
  },
}: RouteComponentProps<{ id: string }>) => {
  const proposal = useProposal(id);

  const [vote, setVote] = useState<Vote>();

  const [showVoteModal, setShowVoteModal] = useState<boolean>(false);
  const [isVotePending, setVotePending] = useState<boolean>(false);

  const [isQueuePending, setQueuePending] = useState<boolean>(false);
  const [isExecutePending, setExecutePending] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const setModal = useCallback((modal: AlertModal) => dispatch(setAlertModal(modal)), [dispatch]);

  const { castVote, castVoteState } = useCastVote();
  const { queueProposal, queueProposalState } = useQueueProposal();
  const { executeProposal, executeProposalState } = useExecuteProposal();

  // Get and format date from data
  const timestamp = Date.now();
  const currentBlock = useBlockNumber();
  const startDate =
    proposal && timestamp && currentBlock
      ? dayjs(timestamp).add(
          AVERAGE_BLOCK_TIME_IN_SECS * (proposal.startBlock - currentBlock),
          'seconds',
        )
      : undefined;

  const endDate =
    proposal && timestamp && currentBlock
      ? dayjs(timestamp).add(
          AVERAGE_BLOCK_TIME_IN_SECS * (proposal.endBlock - currentBlock),
          'seconds',
        )
      : undefined;
  const now = dayjs();

  // Get total votes and format percentages for UI
  const totalVotes = proposal
    ? proposal.forCount + proposal.againstCount + proposal.abstainCount
    : undefined;
  const forPercentage = proposal && totalVotes ? (proposal.forCount * 100) / totalVotes : 0;
  const againstPercentage = proposal && totalVotes ? (proposal.againstCount * 100) / totalVotes : 0;
  const abstainPercentage = proposal && totalVotes ? (proposal.abstainCount * 100) / totalVotes : 0;

  const proposalActive = proposal?.status === ProposalState.ACTIVE;

  // Only count available votes as of the proposal created block
  const availableVotes = useUserVotesAsOfBlock(proposal?.createdBlock ?? undefined);

  const hasVoted = useHasVotedOnProposal(proposal?.id);

  const showBlockRestriction = proposalActive;

  // Only show voting if user has > 0 votes at proposal created block and proposal is active
  const showVotingButtons = availableVotes && !hasVoted && proposalActive;

  const getVoteErrorMessage = (error: string | undefined) => {
    if (error?.match(/voter already voted/)) {
      return 'User Already Voted';
    }
    return error;
  };

  const hasSucceeded = proposal?.status === ProposalState.SUCCEEDED;
  const isAwaitingStateChange = () => {
    if (hasSucceeded) {
      return true;
    }
    if (proposal?.status === ProposalState.QUEUED) {
      return new Date() >= (proposal?.eta ?? Number.MAX_SAFE_INTEGER);
    }
    return false;
  };

  const { forCount = 0, againstCount = 0, quorumVotes = 0 } = proposal || {};
  const quorumReached = forCount > againstCount && forCount >= quorumVotes;

  const moveStateButtonAction = hasSucceeded ? 'Queue' : 'Execute';
  const moveStateAction = (() => {
    if (hasSucceeded) {
      return () => queueProposal(proposal?.id);
    }
    return () => executeProposal(proposal?.id);
  })();

  const onTransactionStateChange = useCallback(
    (
      tx: TransactionStatus,
      successMessage?: string,
      setPending?: (isPending: boolean) => void,
      getErrorMessage?: (error?: string) => string | undefined,
      onFinalState?: () => void,
    ) => {
      switch (tx.status) {
        case 'None':
          setPending?.(false);
          break;
        case 'Mining':
          setPending?.(true);
          break;
        case 'Success':
          setModal({
            title: 'Success',
            message: successMessage || 'Transaction Successful!',
            show: true,
          });
          setPending?.(false);
          onFinalState?.();
          break;
        case 'Fail':
          setModal({
            title: 'Transaction Failed',
            message: tx?.errorMessage || 'Please try again.',
            show: true,
          });
          setPending?.(false);
          onFinalState?.();
          break;
        case 'Exception':
          setModal({
            title: 'Error',
            message: getErrorMessage?.(tx?.errorMessage) || 'Please try again.',
            show: true,
          });
          setPending?.(false);
          onFinalState?.();
          break;
      }
    },
    [setModal],
  );

  useEffect(
    () =>
      onTransactionStateChange(
        castVoteState,
        'Vote Successful!',
        setVotePending,
        getVoteErrorMessage,
        () => setShowVoteModal(false),
      ),
    [castVoteState, onTransactionStateChange, setModal],
  );

  useEffect(
    () => onTransactionStateChange(queueProposalState, 'Proposal Queued!', setQueuePending),
    [queueProposalState, onTransactionStateChange, setModal],
  );

  useEffect(
    () => onTransactionStateChange(executeProposalState, 'Proposal Executed!', setExecutePending),
    [executeProposalState, onTransactionStateChange, setModal],
  );

  const activeAccount = useAppSelector(state => state.account.activeAccount);
  const { loading, error, data } = useQuery(
    nounVotesForProposalQuery(proposal && proposal.id ? proposal?.id : '0'),
  );
  if (!proposal || loading || !data || data.proposals.length === 0) {
    return (
      <div className={classes.spinner}>
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <>Failed to fetch</>;
  }

  const isWalletConnected = !(activeAccount === undefined);
  const isActiveForVoting = startDate?.isBefore(now) && endDate?.isAfter(now);

  const forNouns = getNounVotes(data, 1);
  const againstNouns = getNounVotes(data, 0);
  const abstainNouns = getNounVotes(data, 2);

  return (
    <Section fullWidth={false} className={classes.votePage}>
      <VoteModal
        show={showVoteModal}
        onHide={() => setShowVoteModal(false)}
        onVote={() => castVote(proposal?.id, vote)}
        isLoading={isVotePending}
        proposalId={proposal?.id}
        availableVotes={availableVotes}
        vote={vote}
      />
      <Col lg={10} className={classes.wrapper}>
        {proposal && (
          <ProposalHeader
            proposal={proposal}
            isActiveForVoting={isActiveForVoting}
            isWalletConnected={isWalletConnected}
          />
        )}
      </Col>
      <Col lg={10} className={clsx(classes.proposal, classes.wrapper)}>
        {isAwaitingStateChange() && (
          <Row className={clsx(classes.section, classes.transitionStateButtonSection)}>
            <Col className="d-grid">
              <Button
                onClick={moveStateAction}
                disabled={isQueuePending || isExecutePending}
                variant="dark"
                className={classes.transitionStateButton}
              >
                {isQueuePending || isExecutePending ? (
                  <Spinner animation="border" />
                ) : (
                  `${moveStateButtonAction} Proposal ⌐◧-◧`
                )}
              </Button>
            </Col>
          </Row>
        )}
        {/* <Row>
          <Col lg={4}>
            <Card className={classes.voteCountCard}>
              <Card.Body className="p-2">
                <Card.Text className="py-2 m-0">
                  <span>For</span>
                  <span>{proposal?.forCount}</span>
                </Card.Text>
                <ProgressBar variant="success" now={forPercentage} />
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className={classes.voteCountCard}>
              <Card.Body className="p-2">
                <Card.Text className="py-2 m-0">
                  <span>Against</span>
                  <span>{proposal?.againstCount}</span>
                </Card.Text>
                <ProgressBar variant="danger" now={againstPercentage} />
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className={classes.voteCountCard}>
              <Card.Body className="p-2">
                <Card.Text className="py-2 m-0">
                  <span>Abstain</span>
                  <span>{proposal?.abstainCount}</span>
                </Card.Text>
                <ProgressBar variant="info" now={abstainPercentage} />
              </Card.Body>
            </Card>
          </Col>
        </Row> */}
         <Row>
          <VoteCard
            proposal={proposal}
            percentage={forPercentage}
            nounIds={forNouns}
            variant={VoteCardVariant.FOR}
          />
          <VoteCard
            proposal={proposal}
            percentage={againstPercentage}
            nounIds={againstNouns}
            variant={VoteCardVariant.AGAINST}
          />
          <VoteCard
            proposal={proposal}
            percentage={abstainPercentage}
            nounIds={abstainNouns}
            variant={VoteCardVariant.ABSTAIN}
          />
        </Row>
        <ProposalContent proposal={proposal} />
      </Col>
    </Section>
  );
};

export default VotePage;