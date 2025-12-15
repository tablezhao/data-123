import { useSettingsStore } from '@/stores/settingsStore';

export const Footer = () => {
  const { footerText } = useSettingsStore();
  
  return (
    <footer className="border-t mt-12">
      <div className="container py-6 text-center text-sm text-muted-foreground">
        <p>{footerText}</p>
      </div>
    </footer>
  );
};
