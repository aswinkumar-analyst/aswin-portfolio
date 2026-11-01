import { lazy, Suspense } from "react";
import { formConfig } from "../../config/contact";

// A failed chunk load must not take the page down; the slot just stays empty
// and the form asks the visitor to retry.
const HCaptcha = lazy(() =>
  import("@hcaptcha/react-hcaptcha").catch(() => ({ default: () => null })),
);

// Only mounted once the visitor starts the form, so hCaptcha's script never
// loads for people who are just reading the page. Narrow phones get the compact
// widget: the normal one is a fixed 303px wide.
export default function CaptchaField({ ref, onVerify, onExpire, onError }) {
  const size = window.innerWidth < 380 ? "compact" : "normal";

  return (
    <Suspense fallback={null}>
      <HCaptcha
        ref={ref}
        sitekey={formConfig.captchaSitekey}
        reCaptchaCompat={false}
        size={size}
        onVerify={onVerify}
        onExpire={onExpire}
        onError={onError}
      />
    </Suspense>
  );
}
