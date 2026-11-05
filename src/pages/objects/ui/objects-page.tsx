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

import { useObjects } from "@/entities/object";
import { CreateObjectForm } from "@/features/create-object";
import { EditObjectForm } from "@/features/edit-object";
import { useDeleteObject } from "@/features/delete-object";

export const ObjectsPage = () => {
  const { data: objects, isPending, isError, error } = useObjects();

  const navigate = useNavigate();

  const [editingObjectId, setEditingObjectId] = useState<string | null>(null);
  const deleteObjectMutation = useDeleteObject();

  const handleDelete = async (objectId: string) => {
    const confirmed = window.confirm(
      "Вы действительно хотите удалить этот объект?"
    );

    if (!confirmed) return;

    deleteObjectMutation.reset();

    try {
      await deleteObjectMutation.mutateAsync(objectId);
    } catch {
      // Ошибка отображается ниже через состояние мутации.
    }
  };

  if (isPending) {
    return <Text>Загрузка объектов...</Text>;
  }

  if (isError) {
    return (
      <Text color="red.500">Не удалось загрузить объекты: {error.message}</Text>
    );
  }

  return (
    <Stack gap="6">
      <Heading size="xl">Объекты</Heading>

      <Card.Root variant="outline">
        <Card.Header>
          <Heading size="md">Создать объект</Heading>
        </Card.Header>

        <Card.Body>
          <CreateObjectForm />
        </Card.Body>
      </Card.Root>

      {objects.length === 0 ? (
        <Text color="gray.500">Пока нет доступных объектов.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
          {objects.map((object) => (
            <Card.Root key={object.id} variant="outline">
              <Card.Body>
                {editingObjectId === object.id ? (
                  <Stack gap="3">
                    <Heading size="md">Редактирование объекта</Heading>

                    <EditObjectForm
                      object={object}
                      onSuccess={() => setEditingObjectId(null)}
                    />

                    <Button
                      variant="outline"
                      onClick={() => setEditingObjectId(null)}
                    >
                      Отмена
                    </Button>
                  </Stack>
                ) : (
                  <Stack gap="3">
                    <Heading size="md">{object.name}</Heading>
                    <Text color="fg.muted">{object.address}</Text>

                    <Text fontSize="sm" color="fg.muted">
                      Создан:{" "}
                      {new Date(object.created_at).toLocaleDateString("ru-RU")}
                    </Text>

                    <Stack direction="row">
                      <Button
                        variant="solid"
                        onClick={() => navigate(`/objects/${object.id}`)}
                      >
                        Открыть объект
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setEditingObjectId(object.id)}
                      >
                        Редактировать
                      </Button>

                      <Button
                        colorPalette="red"
                        variant="outline"
                        loading={
                          deleteObjectMutation.isPending &&
                          deleteObjectMutation.variables === object.id
                        }
                        disabled={deleteObjectMutation.isPending}
                        onClick={() => handleDelete(object.id)}
                      >
                        Удалить
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>
      )}

      {deleteObjectMutation.isError && (
        <Text color="red.500">
          Не удалось удалить объект. Возможно, к нему привязаны задачи.
        </Text>
      )}
    </Stack>
  );
};
