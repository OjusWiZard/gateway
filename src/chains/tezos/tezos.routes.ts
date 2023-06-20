import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../services/error-handler';

import * as tezosControllers from './tezos.controllers';

import {
  validateTezosAllowancesRequest,
  validateTezosApproveRequest,
  validateTezosBalanceRequest,
  validateTezosNonceRequest,
} from './tezos.validators';

import {
  AllowancesRequest,
  AllowancesResponse,
  ApproveRequest,
  ApproveResponse,
  BalanceRequest,
  BalanceResponse,
  NonceRequest,
  NonceResponse,
  PollRequest,
  PollResponse,
} from './tezos.request';

import { Tezosish } from '../../services/common-interfaces';
import { getChain } from '../../services/connection-manager';

export namespace TezosRoutes {
  export const router = Router();

  router.post(
    '/nextNonce',
    asyncHandler(
      async (
        req: Request<{}, {}, NonceRequest>,
        res: Response<NonceResponse | string, {}>
      ) => {
        validateTezosNonceRequest(req.body);
        const chain = await getChain(req.body.chain, req.body.network);
        const nonceRes = await tezosControllers.nonce(chain, req.body);
        res.status(200).json({
          ...nonceRes,
          nonce: nonceRes.nonce + 1,
        });
      }
    )
  );

  router.post(
    '/nonce',
    asyncHandler(
      async (
        req: Request<{}, {}, NonceRequest>,
        res: Response<NonceResponse | string, {}>
      ) => {
        validateTezosNonceRequest(req.body);
        const chain = await getChain(req.body.chain, req.body.network);
        res.status(200).json(await tezosControllers.nonce(chain, req.body));
      }
    )
  );

  router.post(
    '/balances',
    asyncHandler(
      async (
        req: Request<{}, {}, BalanceRequest>,
        res: Response<BalanceResponse | string, {}>,
      ) => {
        validateTezosBalanceRequest(req.body);
        const chain = await getChain<Tezosish>('tezos', req.body.network);
        res.status(200).json((await tezosControllers.balances(chain, req.body)));
      }
    )
  );

  router.post(
    '/poll',
    asyncHandler(
      async (
        req: Request<{}, {}, PollRequest>,
        res: Response<PollResponse, {}>
      ) => {
        const chain = await getChain<Tezosish>('tezos', <string>req.body.network);
        res
          .status(200)
          .json(
            await tezosControllers.poll(
              chain,
              {
                chain: req.body.chain,
                network: req.body.network,
                txHash: req.body.txHash
              }
            )
          );
      }
    )
  );

  router.post(
    '/allowances',
    asyncHandler(
      async (
        req: Request<{}, {}, AllowancesRequest>,
        res: Response<AllowancesResponse | string, {}>
      ) => {
        validateTezosAllowancesRequest(req.body);
        const chain = await getChain<Tezosish>(req.body.chain, req.body.network);
        res.status(200).json(await tezosControllers.allowances(chain, req.body));
      }
    )
  );

  router.post(
    '/approve',
    asyncHandler(
      async (
        req: Request<{}, {}, ApproveRequest>,
        res: Response<ApproveResponse | string, {}>
      ) => {
        validateTezosApproveRequest(req.body);
        const chain = await getChain(req.body.chain, req.body.network);
        res.status(200).json(await tezosControllers.approve(chain, req.body));
      }
    )
  );
}