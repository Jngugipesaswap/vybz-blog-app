import { supabase } from "@/integrations/supabase/client";

export interface ActivityLog {
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: any;
  ip_address?: string;
}

export async function logActivity(log: ActivityLog) {
  try {
    // In a production app, you would create an activity_logs table
    // For now, we'll just log to console in development
    console.log("[Activity Log]", {
      ...log,
      timestamp: new Date().toISOString()
    });

    // Example: Insert into activity_logs table (to be created)
    // const { error } = await supabase
    //   .from("activity_logs")
    //   .insert({
    //     ...log,
    //     created_at: new Date().toISOString()
    //   });
    
    // if (error) throw error;
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}

// Helper functions for common activities
export const ActivityLogger = {
  // User management activities
  userRoleChanged: (adminId: string, userId: string, oldRole: string, newRole: string) => {
    logActivity({
      user_id: adminId,
      action: "role_changed",
      resource_type: "user",
      resource_id: userId,
      details: { oldRole, newRole }
    });
  },

  // Content management activities
  postCreated: (userId: string, postId: string, title: string) => {
    logActivity({
      user_id: userId,
      action: "created",
      resource_type: "post",
      resource_id: postId,
      details: { title }
    });
  },

  postUpdated: (userId: string, postId: string, changes: any) => {
    logActivity({
      user_id: userId,
      action: "updated",
      resource_type: "post",
      resource_id: postId,
      details: changes
    });
  },

  postDeleted: (userId: string, postId: string) => {
    logActivity({
      user_id: userId,
      action: "deleted",
      resource_type: "post",
      resource_id: postId
    });
  },

  // Loyalty management activities
  loyaltyPointsAdjusted: (adminId: string, userId: string, points: number, reason: string) => {
    logActivity({
      user_id: adminId,
      action: "points_adjusted",
      resource_type: "loyalty",
      resource_id: userId,
      details: { points, reason }
    });
  },

  // Wallet management activities
  walletTransactionProcessed: (adminId: string, walletId: string, amount: number, type: string) => {
    logActivity({
      user_id: adminId,
      action: "transaction_processed",
      resource_type: "wallet",
      resource_id: walletId,
      details: { amount, type }
    });
  },

  // Comment management activities
  commentModerated: (adminId: string, commentId: string, action: string) => {
    logActivity({
      user_id: adminId,
      action: "moderated",
      resource_type: "comment",
      resource_id: commentId,
      details: { moderationAction: action }
    });
  },

  // Settings changes
  settingsUpdated: (adminId: string, settingKey: string, oldValue: any, newValue: any) => {
    logActivity({
      user_id: adminId,
      action: "settings_updated",
      resource_type: "settings",
      details: { settingKey, oldValue, newValue }
    });
  }
};
