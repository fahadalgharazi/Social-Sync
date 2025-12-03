import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Settings,
  Loader2,
  Lock,
  Globe,
  UserPlus,
  Calendar,
  Trash2,
  ArrowLeft,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  getUserGroups,
  createGroup,
  getGroup,
  getGroupMembers,
  deleteGroup,
  addGroupMember,
} from "../api/groupsApi";
import { getFriends } from "../../friends/api/friendsApi";

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await getUserGroups();
      setGroups(data);
    } catch (error) {
      console.error("Error loading groups:", error);
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (formData) => {
    try {
      await createGroup(formData);
      toast.success("Group created successfully!");
      setShowCreateModal(false);
      await loadGroups();
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(error.response?.data?.message || "Failed to create group");
    }
  };

  const handleSelectGroup = async (group) => {
    try {
      const [groupData, members] = await Promise.all([
        getGroup(group.id),
        getGroupMembers(group.id),
      ]);
      setSelectedGroup(groupData);
      setGroupMembers(members);
    } catch (error) {
      console.error("Error loading group details:", error);
      toast.error("Failed to load group details");
    }
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    if (!confirm(`Are you sure you want to delete "${groupName}"?`)) {
      return;
    }

    try {
      await deleteGroup(groupId);
      toast.success("Group deleted");
      setSelectedGroup(null);
      await loadGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error(error.response?.data?.message || "Failed to delete group");
    }
  };

  const handleAddMember = async (userId, userName) => {
    try {
      await addGroupMember(selectedGroup.id, userId);
      toast.success(`${userName} added to group!`);
      setShowAddMemberModal(false);
      // Reload members
      const members = await getGroupMembers(selectedGroup.id);
      setGroupMembers(members);
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error(error.response?.data?.message || "Failed to add member");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Group Details View
  if (selectedGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={() => setSelectedGroup(null)}
            variant="ghost"
            className="mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Groups
          </Button>

          {/* Group Header */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg mb-6">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{selectedGroup.name}</h1>
                    {selectedGroup.is_private ? (
                      <Lock className="w-5 h-5 text-gray-500" />
                    ) : (
                      <Globe className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  {selectedGroup.description && (
                    <p className="text-gray-600 mb-4">{selectedGroup.description}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {groupMembers.length} {groupMembers.length === 1 ? "member" : "members"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      handleDeleteGroup(selectedGroup.id, selectedGroup.name)
                    }
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members Section */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Members
                </CardTitle>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-indigo-500 to-purple-500"
                  onClick={() => setShowAddMemberModal(true)}
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Add Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {groupMembers.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between p-4 bg-white/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {member.profile?.first_name?.[0]}{member.profile?.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.profile?.first_name} {member.profile?.last_name}
                        </p>
                        {member.profile?.username && (
                          <p className="text-sm text-gray-500">@{member.profile.username}</p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        member.role === "admin"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add Member Modal */}
          {showAddMemberModal && (
            <AddMemberModal
              groupId={selectedGroup.id}
              existingMembers={groupMembers}
              onClose={() => setShowAddMemberModal(false)}
              onAdd={handleAddMember}
            />
          )}
        </div>
      </div>
    );
  }

  // Groups List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Groups</h1>
            <p className="text-gray-600">Coordinate events with your friends</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>

        {/* Groups List */}
        <div className="space-y-4">
          {groups.length === 0 ? (
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No groups yet</h3>
                <p className="text-gray-500 mb-6">
                  Create a group to coordinate events with friends!
                </p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Group
                </Button>
              </CardContent>
            </Card>
          ) : (
            groups.map((group) => (
              <Card
                key={group.id}
                onClick={() => handleSelectGroup(group)}
                className="bg-white/70 backdrop-blur-sm border-white/50 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {group.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{group.name}</h3>
                          {group.is_private ? (
                            <Lock className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Globe className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        {group.description && (
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {group.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {group.member_count || 0} members
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                        {group.role || "member"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create Group Modal */}
        {showCreateModal && (
          <CreateGroupModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateGroup}
          />
        )}
      </div>
    </div>
  );
}

// Simple Create Group Modal Component
function CreateGroupModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPrivate: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Group name is required");
      return;
    }
    setIsSubmitting(true);
    await onCreate(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle>Create New Group</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter group name"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="What's this group about?"
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrivate"
                checked={formData.isPrivate}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isPrivate" className="text-sm text-gray-700">
                Make this group private
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Group"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Add Member Modal Component
function AddMemberModal({ groupId, existingMembers, onClose, onAdd }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const friendsData = await getFriends();
      setFriends(friendsData);
    } catch (error) {
      console.error("Error loading friends:", error);
      toast.error("Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  // Filter out friends who are already members
  const existingMemberIds = existingMembers.map(m => m.id);
  const availableFriends = friends.filter(
    friend => !existingMemberIds.includes(friend.id)
  );

  // Filter by search query
  const filteredFriends = availableFriends.filter(friend =>
    searchQuery
      ? `${friend.first_name} ${friend.last_name} ${friend.username}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white max-h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>Add Member</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-4">
            <Input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">
                {availableFriends.length === 0
                  ? "All your friends are already members"
                  : "No friends found"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={friend.profile_picture_url}
                      firstName={friend.first_name}
                      lastName={friend.last_name}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {friend.first_name} {friend.last_name}
                      </p>
                      {friend.username && (
                        <p className="text-sm text-gray-500">@{friend.username}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onAdd(friend.id, `${friend.first_name} ${friend.last_name}`)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
