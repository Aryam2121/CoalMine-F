import PageShell from '../components/ui/PageShell';
import TrainingGamification from '../components/TrainingGamification';

const TrainingPage = () => (
  <PageShell
    title="Training center"
    subtitle="Safety courses, certifications, and team leaderboard"
    variant="dark"
  >
    <TrainingGamification />
  </PageShell>
);

export default TrainingPage;
