public interface PaymentService {
	PaymentResponse processPayment(PaymentRequest request) throws MyBusinessException;
}

