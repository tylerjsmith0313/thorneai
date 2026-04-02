
import React from 'react';
import { TenantConfig, AIProvider } from '../types';
import InfrastructureHeader from './InfrastructureHeader';
import InfrastructureSection from './InfrastructureSection';
import InfrastructureField from './InfrastructureField';

interface Step6Props {
  config: TenantConfig;
  updateNested: (section: keyof TenantConfig, field: string, value: any) => void;
}

const Step6InfrastructureMatrix: React.FC<Step6Props> = ({ config, updateNested }) => {
  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 max-w-6xl mx-auto w-full pb-10">
      <InfrastructureHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto pr-2 custom-scrollbar flex-1 px-4">
        {/* Supabase */}
        <InfrastructureSection title="Primary Database (Supabase)">
          <InfrastructureField label="Supabase Project URL" value={config.supabase.url} onChange={v => updateNested('supabase', 'url', v)} placeholder="https://xyz.supabase.co" />
          <InfrastructureField label="Anon Public Key" value={config.supabase.anonKey} onChange={v => updateNested('supabase', 'anonKey', v)} type="password" />
          <InfrastructureField label="Service Role Key" value={config.supabase.serviceRole} onChange={v => updateNested('supabase', 'serviceRole', v)} type="password" />
        </InfrastructureSection>

        {/* Stripe */}
        <InfrastructureSection title="Financial Layer (Stripe)">
          <InfrastructureField label="Secret API Key" value={config.stripe.secretKey} onChange={v => updateNested('stripe', 'secretKey', v)} type="password" />
          <InfrastructureField label="Publishable Key" value={config.stripe.publishableKey} onChange={v => updateNested('stripe', 'publishableKey', v)} />
          <InfrastructureField label="Webhook Secret" value={config.stripe.webhookSecret} onChange={v => updateNested('stripe', 'webhookSecret', v)} type="password" />
        </InfrastructureSection>

        {/* Twilio */}
        <InfrastructureSection title="Communication (Twilio)">
          <InfrastructureField label="Account SID" value={config.twilio.accountSid} onChange={v => updateNested('twilio', 'accountSid', v)} />
          <InfrastructureField label="Auth Token" value={config.twilio.authToken} onChange={v => updateNested('twilio', 'authToken', v)} type="password" />
          <InfrastructureField label="Provisioned Number" value={config.twilio.fromNumber} onChange={v => updateNested('twilio', 'fromNumber', v)} placeholder="+1234567890" />
        </InfrastructureSection>

        {/* Zoom */}
        <InfrastructureSection title="Voice & Meetings (Zoom)">
          <InfrastructureField label="Client ID" value={config.zoom.clientId} onChange={v => updateNested('zoom', 'clientId', v)} />
          <InfrastructureField label="Client Secret" value={config.zoom.clientSecret} onChange={v => updateNested('zoom', 'clientSecret', v)} type="password" />
          <InfrastructureField label="Account ID" value={config.zoom.accountId} onChange={v => updateNested('zoom', 'accountId', v)} />
        </InfrastructureSection>

        {/* AI & Intelligence */}
        <InfrastructureSection title="Intelligence Matrix">
          <div className="mb-6 px-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">AI Orchestrator</label>
            <select 
              className="w-full px-5 py-3.5 rounded-2xl bg-white border-2 border-slate-100 text-sm font-bold text-slate-900 outline-none focus:border-indigo-200 transition-all appearance-none cursor-pointer"
              value={config.ai.provider}
              onChange={e => updateNested('ai', 'provider', e.target.value)}
            >
              {/* Fix: Explicitly cast enum values to strings to resolve key, value and children types */}
              {(Object.values(AIProvider) as string[]).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <InfrastructureField label={`${config.ai.provider} Master Key`} value={config.ai.apiKey} onChange={v => updateNested('ai', 'apiKey', v)} type="password" />
        </InfrastructureSection>

        {/* Mailgun & Domain */}
        <InfrastructureSection title="Outbound Logic (Mailgun)">
          <InfrastructureField label="Sending Domain" value={config.mailgun.domain} onChange={v => updateNested('mailgun', 'domain', v)} placeholder="mg.yourdomain.com" />
          <InfrastructureField label="Private API Key" value={config.mailgun.apiKey} onChange={v => updateNested('mailgun', 'apiKey', v)} type="password" />
        </InfrastructureSection>

        {/* DNS & Host */}
        <InfrastructureSection title="Network & DNS">
          <InfrastructureField label="DNS Provider" value={config.dns.provider} onChange={v => updateNested('dns', 'provider', v)} placeholder="Cloudflare, AWS Route53, etc." />
          <InfrastructureField label="DNS API Key" value={config.dns.apiKey} onChange={v => updateNested('dns', 'apiKey', v)} type="password" />
          <InfrastructureField label="Root Domain" value={config.dns.domain} onChange={v => updateNested('dns', 'domain', v)} placeholder="example.com" />
        </InfrastructureSection>

        {/* Gifting */}
        <InfrastructureSection title="Autonomous Gifting">
          <InfrastructureField label="Postalytics API Key" value={config.gifting.postalyticsKey} onChange={v => updateNested('gifting', 'postalyticsKey', v)} type="password" />
          <InfrastructureField label="Sendoso API Key" value={config.gifting.sendosoKey} onChange={v => updateNested('gifting', 'sendosoKey', v)} type="password" />
        </InfrastructureSection>
      </div>
    </div>
  );
};

export default Step6InfrastructureMatrix;
