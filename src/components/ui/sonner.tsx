import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Inner Wake toasts — calm, luminous, never celebratory.
 * Single toast surface for the whole app.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      offset="calc(env(safe-area-inset-top) + 0.75rem)"
      gap={10}
      visibleToasts={3}
      className="toaster group"
      toastOptions={{
        duration: 3600,
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-2xl group-[.toaster]:border-primary/15 group-[.toaster]:bg-card/85 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-foreground group-[.toaster]:shadow-[0_18px_50px_-20px_hsl(var(--primary)/0.4)]",
          title: "group-[.toast]:font-heading group-[.toast]:font-light group-[.toast]:tracking-wide",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:leading-relaxed",
          actionButton:
            "group-[.toast]:rounded-full group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:rounded-full group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
