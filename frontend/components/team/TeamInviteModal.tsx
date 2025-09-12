import { useState } from "react";
import {
  Button,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { Input } from "@heroui/input";
import {
  UserSearchResult,
  searchUsersForInvite,
  sendTeamInvite,
} from "@/app/actions/team";
import { usePlausible } from "next-plausible";

interface TeamInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  eventId: string;
}

export const TeamInviteModal = ({
  isOpen,
  onClose,
  eventId,
}: TeamInviteModalProps) => {
  const plausible = usePlausible();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState<Record<string, boolean>>({});

  // Handle search input change
  const handleSearchChange = async (value: string) => {
    setSearchQuery(value);

    if (value.length >= 2) {
      setIsSearching(true);
      try {
        const results = await searchUsersForInvite(eventId, value);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Send invite to a user
  const handleInviteUser = async (userId: string) => {
    plausible("invite_team_member");
    setIsInviting((prev) => ({ ...prev, [userId]: true }));
    try {
      await sendTeamInvite(eventId, userId);

      setSearchResults((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, isInvited: true } : user,
        ),
      );
    } catch (error: any) {
      // You can customize this error message as needed
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to send invite.",
      );
    } finally {
      setIsInviting((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Invite first non-invited search result on Enter
  const handleEnterToInvite = () => {
    if (isSearching || searchResults.length === 0) return;
    const firstAvailable = searchResults.find((u) => !u.isInvited);
    if (!firstAvailable) return;
    if (isInviting[firstAvailable.id]) return;
    void handleInviteUser(firstAvailable.id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>
          <h3 className="text-xl font-semibold">Invite Team Members</h3>
        </ModalHeader>
        <ModalBody>
          <Input
            label="Search Users"
            placeholder="Search by username or name"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="mb-4"
            autoFocus={true}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleEnterToInvite();
              }
            }}
          />
          <div className="max-h-[300px] overflow-y-auto">
            {isSearching ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
              </div>
            ) : searchQuery.length < 2 ? (
              <p className="text-default-500 text-center py-2">
                Type at least 2 characters to search
              </p>
            ) : searchResults.length === 0 ? (
              <p className="text-default-500 text-center py-2">
                No users found
              </p>
            ) : (
              searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex justify-between items-center p-2 border-b border-default-200 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      size="sm"
                      name={(user.name || "User").substring(0, 2).toUpperCase()}
                      src={user.profilePicture}
                    />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-default-500 text-sm">
                        {user.username}
                      </p>
                    </div>
                  </div>
                  <Button
                    color="primary"
                    size="sm"
                    variant="flat"
                    isDisabled={user.isInvited}
                    isLoading={isInviting[user.id]}
                    onPress={() => handleInviteUser(user.id)}
                  >
                    {user.isInvited ? "Invited" : "Invite"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TeamInviteModal;
