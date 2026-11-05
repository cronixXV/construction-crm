import { useState } from "react";
import { Button, Stack, Text } from "@chakra-ui/react";

import { RevisionCommentDialog } from "./revision-comment-dialog";
import { useChangeTaskStatus } from "../api/use-change-task-status";

import type { TTaskStatus } from "@/entities/task";

interface IChangeTaskStatusActionsProps {
  taskId: string;
  objectId: string;
  assigneeId: string;
  status: TTaskStatus;
  role: "manager" | "executor";
}

export const ChangeTaskStatusActions = ({
  taskId,
  objectId,
  assigneeId,
  status,
  role,
}: IChangeTaskStatusActionsProps) => {
  const [isRevisionDialogOpen, setIsRevisionDialogOpen] = useState(false);

  const changeStatusMutation = useChangeTaskStatus();

  const handleChangeStatus = (newStatus: TTaskStatus) => {
    changeStatusMutation.mutate({
      taskId,
      objectId,
      assigneeId,
      newStatus,
    });
  };

  const handleOpenRevisionDialog = () => {
    changeStatusMutation.reset();
    setIsRevisionDialogOpen(true);
  };

  const handleRequestRevision = (comment: string) => {
    changeStatusMutation.mutate(
      {
        taskId,
        objectId,
        assigneeId,
        newStatus: "revision",
        comment,
      },
      {
        onSuccess: () => {
          setIsRevisionDialogOpen(false);
        },
      }
    );
  };

  const isPending = changeStatusMutation.isPending;

  return (
    <Stack gap="3">
      {role === "executor" && status === "new" && (
        <Button
          onClick={() => handleChangeStatus("in_progress")}
          loading={isPending}
          disabled={isPending}
        >
          Взять в работу
        </Button>
      )}

      {role === "executor" && status === "in_progress" && (
        <Button
          onClick={() => handleChangeStatus("review")}
          loading={isPending}
          disabled={isPending}
        >
          Отправить на проверку
        </Button>
      )}

      {role === "executor" && status === "revision" && (
        <Button
          onClick={() => handleChangeStatus("in_progress")}
          loading={isPending}
          disabled={isPending}
        >
          Повторно взять в работу
        </Button>
      )}

      {role === "manager" && status === "review" && (
        <>
          <Button
            colorPalette="green"
            onClick={() => handleChangeStatus("accepted")}
            loading={isPending}
            disabled={isPending}
          >
            Принять задачу
          </Button>

          <Button
            colorPalette="orange"
            variant="outline"
            onClick={handleOpenRevisionDialog}
            disabled={isPending}
          >
            Вернуть на доработку
          </Button>

          <RevisionCommentDialog
            open={isRevisionDialogOpen}
            isPending={isPending}
            isError={changeStatusMutation.isError}
            onOpenChange={setIsRevisionDialogOpen}
            onSubmit={handleRequestRevision}
          />
        </>
      )}

      {changeStatusMutation.isError && !isRevisionDialogOpen && (
        <Text color="red.500" fontSize="sm">
          Не удалось изменить статус задачи. Попробуйте ещё раз.
        </Text>
      )}
    </Stack>
  );
};
