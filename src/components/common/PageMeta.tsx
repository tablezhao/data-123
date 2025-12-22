import { HelmetProvider, Helmet } from "react-helmet-async";
import { useSettingsStore } from '@/stores/settingsStore';

interface PageMetaProps {
  title: string;
  description: string;
  image?: string;
}

const PageMeta = ({
  title,
  description,
  image,
}: PageMetaProps) => {
  const { logoUrl } = useSettingsStore();
  
  return (
    <Helmet>
      {/* 页面标题 */}
      <title>{title}</title>
      
      {/* 基本元信息 */}
      <meta name="description" content={description} />
      
      {/* 社交媒体元信息 */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={image || logoUrl || ''} />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || logoUrl || ''} />
    </Helmet>
  );
};

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta;
