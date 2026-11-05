import { useState } from "react";
import { Button, Dialog, Field, Text, Textarea } from "@chakra-ui/react";

interface IRevisionCommentDialogProps {
  open: boolean;
  isPending: boolean;
  isError: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (comment: string) => void;
}

export const RevisionCommentDialog = ({
  open,
  isPending,
  isError,
  onOpenChange,
  onSubmit,
}: IRevisionCommentDialogProps) => {
  const [comment, setComment] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = () => {
    const trimmedComment = comment.trim();

    if (!trimmedComment) {
      setValidationError("Введите комментарий");
      return;
    }

    if (trimmedComment.length > 2000) {
      setValidationError("Максимум 2000 символов");
      return;
    }

    setValidationError("");
    onSubmit(trimmedComment);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isPending) return;

    if (!nextOpen) {
      setComment("");
      setValidationError("");
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => handleOpenChange(details.open)}
      closeOnEscape={!isPending}
      closeOnInteractOutside={!isPending}
    >
      <Dialog.Backdrop />

      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Вернуть задачу на доработку</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            <Field.Root invalid={Boolean(validationError)}>
              <Field.Label>Комментарий</Field.Label>

              <Textarea
                value={comment}
                onChange={(event) => {
                  setComment(event.target.value);
                  setValidationError("");
                }}
                placeholder="Опишите, что необходимо исправить..."
                rows={5}
                maxLength={2000}
                disabled={isPending}
              />

              <Field.HelperText>
                Укажите причину возврата задачи исполнителю.
              </Field.HelperText>

              {validationError && (
                <Field.ErrorText>{validationError}</Field.ErrorText>
              )}
            </Field.Root>

            {isError && (
              <Text color="red.500" fontSize="sm" mt="3">
                Не удалось вернуть задачу на доработку. Попробуйте ещё раз.
              </Text>
            )}
          </Dialog.Body>

          <Dialog.Footer>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Отмена
            </Button>

            <Button
              colorPalette="orange"
              onClick={handleSubmit}
              loading={isPending}
              disabled={!comment.trim() || isPending}
            >
              Вернуть на доработку
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
