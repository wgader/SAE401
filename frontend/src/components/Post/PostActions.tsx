import { useState, useImperativeHandle, forwardRef } from "react";
import { api } from "../../lib/api";
import { useStore } from "../../store/StoreContext";
import { ConfirmModal } from "../ui/Overlay/ConfirmModal";
import EditPostModal from "./EditPostModal";
import ReplyModal from "./ReplyModal";

interface ConfirmModalConfig {
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => Promise<void>;
    variant: "primary" | "danger";
}

export interface PostActionsRef {
    openEdit: () => void;
    openReply: () => void;
    openDeleteConfirm: () => void;
    openPinConfirm: (isPinned: boolean) => void;
    openBlockConfirm: (isBlocked: boolean) => void;
}

interface PostActionsProps {
    post: any;
    onDeleteSuccess?: (id: number) => void;
}

export const PostActions = forwardRef<PostActionsRef, PostActionsProps>(({ post, onDeleteSuccess }, ref) => {
    const [showEdit, setShowEdit] = useState(false);
    const [showReply, setShowReply] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPinning, setIsPinning] = useState(false);
    const [activeConfirmModal, setActiveConfirmModal] = useState<ConfirmModalConfig | null>(null);
    const { deletePost, toggleBlock } = useStore();

    const handleBlock = async () => {
        try {
            const data = await api.blockUser(post.user.username);
            toggleBlock(post.user.username, data);
            setActiveConfirmModal(null);
        } catch (err) {
            console.error(err);
        }
    };

    useImperativeHandle(ref, () => ({
        openEdit: () => setShowEdit(true),
        openReply: () => setShowReply(true),
        openDeleteConfirm: () => {
            setActiveConfirmModal({
                title: "Supprimer le post ?",
                message: "Cette action est irréversible et supprimera le post de votre profil et du fil d'actualité.",
                confirmLabel: "Supprimer",
                variant: "danger",
                onConfirm: async () => {
                    setIsDeleting(true);
                    try {
                        await api.deletePost(post.id);
                        deletePost(post.id);
                        if (onDeleteSuccess) onDeleteSuccess(post.id);
                    } catch (err) { console.error(err); }
                    finally { setIsDeleting(false); }
                }
            });
        },
        openPinConfirm: (isPinned: boolean) => {
            if (isPinned) {
                setActiveConfirmModal({
                    title: "Désépingler ce post ?",
                    message: "Ce post ne sera plus affiché en haut de votre profil.",
                    confirmLabel: "Désépingler",
                    variant: "primary",
                    onConfirm: async () => {
                        setIsPinning(true);
                        try {
                            await api.unpinPost(post.id);
                            window.location.reload();
                        } catch (err) { console.error(err); }
                        finally { setIsPinning(false); }
                    }
                });
            } else {
                setActiveConfirmModal({
                    title: "Épingler ce post ?",
                    message: "Ce post sera désormais affiché en haut de votre profil.",
                    confirmLabel: "Épingler",
                    variant: "primary",
                    onConfirm: async () => {
                        setIsPinning(true);
                        try {
                            await api.pinPost(post.id);
                            window.location.reload();
                        } catch (err) { console.error(err); }
                        finally { setIsPinning(false); }
                    }
                });
            }
        },
        openBlockConfirm: (isBlockedByMe: boolean) => {
            setActiveConfirmModal({
                title: isBlockedByMe ? `Débloquer @${post.user.username} ?` : `Bloquer @${post.user.username} ?`,
                message: isBlockedByMe 
                    ? "Ils pourront à nouveau vous suivre et voir vos posts."
                    : "Ils ne pourront plus vous suivre, voir vos posts ou vous taguer. Cette action est réversible.",
                confirmLabel: isBlockedByMe ? "Débloquer" : "Bloquer",
                variant: isBlockedByMe ? "primary" : "danger",
                onConfirm: handleBlock
            });
        }
    }));

    return (
        <>
            {showEdit && (
                <EditPostModal
                    post={post}
                    onClose={() => setShowEdit(false)}
                />
            )}

            {showReply && (
                <ReplyModal
                    parentPost={post}
                    onClose={() => setShowReply(false)}
                />
            )}

            {activeConfirmModal && (
                <ConfirmModal
                    title={activeConfirmModal.title}
                    message={activeConfirmModal.message}
                    confirmLabel={
                        isDeleting ? "Suppression..." : 
                        isPinning ? "Action..." : 
                        activeConfirmModal.confirmLabel
                    }
                    onConfirm={async () => {
                        await activeConfirmModal.onConfirm();
                        setActiveConfirmModal(null);
                    }}
                    onCancel={() => setActiveConfirmModal(null)}
                    variant={activeConfirmModal.variant}
                />
            )}
        </>
    );
});
