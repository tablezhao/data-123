import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import CategoryManagement from '@/components/admin/CategoryManagement';
import WebsiteManagement from '@/components/admin/WebsiteManagement';
import UserManagement from '@/components/admin/UserManagement';
import SettingsManagement from '@/components/admin/SettingsManagement';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('categories');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">管理后台</h1>
              <p className="text-muted-foreground mt-2">管理网站分类、链接和系统配置</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="categories">分类管理</TabsTrigger>
            <TabsTrigger value="websites">网站管理</TabsTrigger>
            <TabsTrigger value="users">用户管理</TabsTrigger>
            <TabsTrigger value="settings">系统配置</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <CategoryManagement />
          </TabsContent>

          <TabsContent value="websites">
            <WebsiteManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
