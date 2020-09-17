
const data = {
nodes: [
	{ id: 'askBillAmountAction', incoming_requests: '247', outgoing_requests: '247' },
	{ id: 'askBillOperatorSlotAction', incoming_requests: '499', outgoing_requests: '499' },
	{ id: 'PaymentInstrumentDeterminationAction', incoming_requests: '252', outgoing_requests: '252' },
	{ id: 'askBillAmountConfirmationAction', incoming_requests: '247', outgoing_requests: '247' },
	{ id: 'initialGetBillTypeSlotAction', incoming_requests: '1000', outgoing_requests: '1000' },
	{ id: 'PayBillWorkflowAction', incoming_requests: '252', outgoing_requests: '0' },
	{ id: 'askBillTypeSlotAction', incoming_requests: '499', outgoing_requests: '499' },
	{ id: 'verifyVoicePurchaseEnabledAction', incoming_requests: '0', outgoing_requests: '1000' },
	{ id: 'sufficientAPayBalanceVerificationAction', incoming_requests: '252', outgoing_requests: '252' },
	{ id: 'autoFetchBillAmountAction', incoming_requests: '267', outgoing_requests: '128' },
	{ id: 'askBillAmountValidationAction', incoming_requests: '247', outgoing_requests: '124' },
	{ id: 'autoFetchBillConfirmationAction', incoming_requests: '128', outgoing_requests: '128' },
	{ id: 'processBillTypeAction', incoming_requests: '1000', outgoing_requests: '514' },
	{ id: 'DetermineBillerNumberAction', incoming_requests: '514', outgoing_requests: '514' },
],
edges: [
	{ id: 'e0', source: 'verifyVoicePurchaseEnabledAction', target: 'initialGetBillTypeSlotAction', total_requests: '1000' },
	{ id: 'e1', source: 'DetermineBillerNumberAction', target: 'autoFetchBillAmountAction', total_requests: '267' },
	{ id: 'e2', source: 'autoFetchBillConfirmationAction', target: 'sufficientAPayBalanceVerificationAction', total_requests: '128' },
	{ id: 'e3', source: 'askBillAmountValidationAction', target: 'sufficientAPayBalanceVerificationAction', total_requests: '124' },
	{ id: 'e4', source: 'sufficientAPayBalanceVerificationAction', target: 'PaymentInstrumentDeterminationAction', total_requests: '252' },
	{ id: 'e5', source: 'processBillTypeAction', target: 'DetermineBillerNumberAction', total_requests: '514' },
	{ id: 'e6', source: 'askBillOperatorSlotAction', target: 'processBillTypeAction', total_requests: '499' },
	{ id: 'e7', source: 'initialGetBillTypeSlotAction', target: 'processBillTypeAction', total_requests: '501' },
	{ id: 'e8', source: 'DetermineBillerNumberAction', target: 'askBillAmountAction', total_requests: '247' },
	{ id: 'e9', source: 'askBillAmountConfirmationAction', target: 'askBillAmountValidationAction', total_requests: '247' },
	{ id: 'e10', source: 'initialGetBillTypeSlotAction', target: 'askBillTypeSlotAction', total_requests: '499' },
	{ id: 'e11', source: 'PaymentInstrumentDeterminationAction', target: 'PayBillWorkflowAction', total_requests: '252' },
	{ id: 'e12', source: 'askBillAmountAction', target: 'askBillAmountConfirmationAction', total_requests: '247' },
	{ id: 'e13', source: 'autoFetchBillAmountAction', target: 'autoFetchBillConfirmationAction', total_requests: '128' },
	{ id: 'e14', source: 'askBillTypeSlotAction', target: 'askBillOperatorSlotAction', total_requests: '499' },
],
};

export function myData() {
  return data;
}
