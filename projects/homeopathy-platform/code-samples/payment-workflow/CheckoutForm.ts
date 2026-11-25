export default function CheckoutForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { localCartData } = useCart();
  const { handleSubmit, isSubmitting, errors } = useCheckoutSubmit(onSuccess);
  const { handleZipcodeChange } = useCheckoutCalculateShippingController();

  return (
    <div>
      <form
        className="grid grid-cols-1 lg:grid-cols-[1fr_380px] lg:gap-16"
        onSubmit={handleSubmit}
      >
        {localCartData?.orderToken && (
          <>
            <input
              type="hidden"
              name="orderToken"
              value={localCartData?.orderToken}
            />
            {/* Hardcoded partner ID */}
            <input
              type="hidden"
              name="shipping.partnerId"
              value={1}
            />
          </>
        )}
        <div>
          <fieldset>
            <legend className="text-lg text-bold mb-4">Data Penerima</legend>
            <FormInputField
              labelText="Nama:"
              placeHolder="Contoh: Arif Rahman Hakim"
              inputName="customer.name"
              errors={errors}
            />

            <FormInputField
              labelText="Email:"
              placeHolder="Contoh: arif-rahman-hakim@gmail.com"
              inputName="customer.email"
              errors={errors}
              inputType="email"
            />

            <FormInputField
              labelText="Nomor Telepon:"
              placeHolder="Contoh: 0812345678"
              inputName="customer.phone"
              errors={errors}
            />
          </fieldset>

          <fieldset className="flex flex-col">
            <FormTextAreaField
              labelText="Alamat Lengkap:"
              placeHolder="Contoh: Jalan gang kelinci I no 3 RT/RW 04/05 Sleman, Yogyakarta"
              inputName="shipping.address"
              errors={errors}
            />

            <FormInputField
              labelText="Kode Pos:"
              placeHolder="Contoh: 12420"
              inputName="shipping.zipcode"
              errors={errors}
              inputType="text"
              inputMode="numeric"
              maxLength={5}
              onChange={handleZipcodeChange}
            />
          </fieldset>
          <fieldset>
            <legend className="text-lg text-bold mb-4">Pesanan kamu</legend>
            <CheckoutCartList />
          </fieldset>
        </div>
        <div className="lg:sticky lg:top-24 h-fit">
          <fieldset className="mb-8">
            <OrderSummaryCheckout isSubmitting={isSubmitting} errors={errors} />
          </fieldset>
        </div>
      </form>
    </div>
  );
}