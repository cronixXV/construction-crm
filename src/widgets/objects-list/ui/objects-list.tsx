import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";

import { ObjectCard, useObjects } from "@/entities/object";
import { CreateObjectForm } from "@/features/create-object";
import { EditObjectForm } from "@/features/edit-object";
import { useDeleteObject } from "@/features/delete-object";

export const ObjectsList = () => {
  const { data: objects, isPending, isError, error } = useObjects();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const deleteMutation = useDeleteObject();

  const handleDelete = async (id: string) => {
    if (!window.confirm("Вы действительно хотите удалить этот объект?")) return;
    deleteMutation.reset();
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // ошибка показывается через deleteMutation.isError
    }
  };

  if (isPending) return <Text>Загрузка объектов...</Text>;

  if (isError)
    return (
      <Text color="red.500">Не удалось загрузить объекты: {error.message}</Text>
    );

  return (
    <Stack gap="6">
      <Card.Root variant="outline">
        <Card.Header>
          <Heading size="md">Создать объект</Heading>
        </Card.Header>
        <Card.Body>
          <CreateObjectForm />
        </Card.Body>
      </Card.Root>

      {objects.length === 0 ? (
        <Text color="fg.muted">Пока нет доступных объектов.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
          {objects.map((object) => (
            <Card.Root key={object.id} variant="outline">
              <Card.Body>
                {editingId === object.id ? (
                  <Stack gap="3">
                    <Heading size="md">Редактирование объекта</Heading>
                    <EditObjectForm
                      object={object}
                      onSuccess={() => setEditingId(null)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      Отмена
                    </Button>
                  </Stack>
                ) : (
                  <ObjectCard
                    object={object}
                    showCreatedAt
                    actions={
                      <Stack direction="row">
                        <Button
                          onClick={() => navigate(`/objects/${object.id}`)}
                        >
                          Открыть объект
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingId(object.id)}
                        >
                          Редактировать
                        </Button>
                        <Button
                          colorPalette="red"
                          variant="outline"
                          loading={
                            deleteMutation.isPending &&
                            deleteMutation.variables === object.id
                          }
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDelete(object.id)}
                        >
                          Удалить
                        </Button>
                      </Stack>
                    }
                  />
                )}
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>
      )}

      {deleteMutation.isError && (
        <Text color="red.500">
          Не удалось удалить объект. Возможно, к нему привязаны задачи.
        </Text>
      )}
    </Stack>
  );
};
