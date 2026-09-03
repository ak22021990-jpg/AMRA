import { BentoCard, PillButton, ProgressRing } from '../components/ui';

export default function TestPage() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-4">UI Component Test</h1>
      <PillButton>Primary Button</PillButton>
      <PillButton variant="secondary">Secondary Button</PillButton>
      <PillButton variant="ghost">Ghost Button</PillButton>
      <BentoCard>
        <p>Bento Card Content</p>
      </BentoCard>
      <ProgressRing progress={75} />
      <ProgressRing progress={40} size={80} strokeWidth={6} color="var(--secondary)" />
    </div>
  );
}
