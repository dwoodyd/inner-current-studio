const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

export function PaymentTestModeBanner() {
  if (!clientToken?.startsWith("test_")) return null;

  return (
    <div className="w-full border-b border-primary/10 bg-card/80 px-3 py-1 text-center text-[10px] text-muted-foreground backdrop-blur md:text-xs">
      Payments are in test mode.{" "}
      <a
        href="https://docs.lovable.dev/features/payments#test-and-live-environments"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary underline underline-offset-2"
      >
        Details
      </a>
    </div>
  );
}
