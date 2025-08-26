import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'editor' | 'viewer';

interface AdminAuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  hasAccess: boolean;
}

export const useAdminAuth = (): AdminAuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser) {
          const { data: roleData } = await supabase.rpc('get_user_role', {
            _user_id: currentUser.id
          });
          setRole(roleData || 'viewer');
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error('Error checking admin auth:', error);
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          try {
            const { data: roleData } = await supabase.rpc('get_user_role', {
              _user_id: currentUser.id
            });
            setRole(roleData || 'viewer');
          } catch (error) {
            console.error('Error getting user role:', error);
            setRole('viewer');
          }
        } else {
          setRole(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = role === 'admin';
  const isEditor = role === 'editor' || isAdmin;
  const hasAccess = role && ['admin', 'editor', 'viewer'].includes(role);

  return {
    user,
    role,
    loading,
    isAdmin,
    isEditor,
    hasAccess: !!hasAccess
  };
};

export const useAdminAction = () => {
  const logAction = async (
    action: string,
    resourceType?: string,
    resourceId?: string,
    details?: any
  ) => {
    try {
      await supabase.rpc('log_admin_activity', {
        _action: action,
        _resource_type: resourceType,
        _resource_id: resourceId,
        _details: details
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  };

  return { logAction };
};