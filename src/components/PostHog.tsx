import Script from "next/script";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

/** PostHog's official loader snippet, verbatim; only the token comes from env. */
export function PostHog() {
  if (!POSTHOG_KEY) return null;

  const snippet = `
!function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}p||((p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",p.onerror=function(){p=null},(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r));var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="du vu fu pu yu init Bu Hu Nu qu Vu Kl ju Zu Ou th eh ih nh sh rh capture getExtension zu hu uh calculateEventProperties ah register register_once register_for_session unregister unregister_for_session ph Lu hh getFeatureFlag getFeatureFlagPayload getFeatureFlagResult getAllFeatureFlags isFeatureEnabled reloadFeatureFlags updateFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync gh identify setPersonProperties unsetPersonProperties group setGroupPropertiesForFlags resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags resetGroupPropertiesForFlags reset mh shutdown setIdentity clearIdentity get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException addExceptionStep captureLog startExceptionAutocapture stopExceptionAutocapture loadToolbar get_property getSessionProperty dh Ku createPersonProfile setInternalOrTestUser fh bu opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing Qu debug Xl Os getPageViewId captureTraceFeedback captureTraceMetric Pu".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
posthog.init(${JSON.stringify(POSTHOG_KEY)}, {
  api_host: ${JSON.stringify(POSTHOG_HOST)},
  defaults: '2026-05-30',
  person_profiles: 'identified_only',
  // Heatmaps and replay also need to be switched on in the PostHog project
  // settings; these flags only let the client collect the data.
  enable_heatmaps: true,
  capture_exceptions: true,
  session_recording: {
    // Inputs are masked by default; notes people type into proof tasks
    // count as personal, so mask any text they enter too.
    maskAllInputs: true,
    maskTextSelector: '[data-ph-mask]',
  },
});
`;

  return <Script id="posthog" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: snippet }} />;
}
