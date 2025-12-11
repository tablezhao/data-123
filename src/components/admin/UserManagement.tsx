import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, User as UserIcon } from 'lucide-react';
import { getAllUsers, updateUserRole } from '@/db/api';
import type { Profile } from '@/types';
import { format } from 'date-fns';

export default function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('加载用户失败:', error);
      toast.error('加载用户失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId: string, role: 'user' | 'admin') {
    try {
      await updateUserRole(userId, role);
      toast.success('用户角色已更新');
      loadUsers();
    } catch (error) {
      console.error('更新失败:', error);
      toast.error('更新失败');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>用户管理</CardTitle>
        <CardDescription>管理用户角色和权限</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">加载中...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">暂无用户</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户名</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <UserIcon className="w-4 h-4" />
                        </div>
                      )}
                      <span className="font-medium">{user.username || '未设置'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.role === 'admin' ? (
                      <Badge variant="default">
                        <Shield className="w-3 h-3 mr-1" />
                        管理员
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <UserIcon className="w-3 h-3 mr-1" />
                        普通用户
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), 'yyyy-MM-dd HH:mm')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={user.role}
                      onValueChange={(value: 'user' | 'admin') =>
                        handleRoleChange(user.id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">普通用户</SelectItem>
                        <SelectItem value="admin">管理员</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
