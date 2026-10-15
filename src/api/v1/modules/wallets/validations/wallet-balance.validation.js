const { z } = require('zod');

const walletIdParams = z.object({ id: z.string().uuid('Invalid wallet UUID') });
const balanceBody = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required').max(255),
  referenceId: z.string().optional(),
});

const creditWalletSchema = { params: walletIdParams, body: balanceBody };
const debitWalletSchema = { params: walletIdParams, body: balanceBody };
const adjustWalletSchema = {
  params: walletIdParams,
  body: z.object({
    amount: z.number().refine((value) => value !== 0, 'Adjustment amount cannot be zero'),
    reason: z.string().min(1, 'Reason is required').max(255),
    referenceId: z.string().optional(),
  }),
};

module.exports = { creditWalletSchema, debitWalletSchema, adjustWalletSchema };