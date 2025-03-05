import { ChangeEvent, useState, useEffect, useContext } from "react";
import Image from "next/image";
import { FiUpload } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { setupAPIClientBlog } from "@/services/api_blog";
import { AuthContextBlog } from "@/contexts/AuthContextBlog";
import { Input } from "@/app/components/input";

const schema = z.object({
  name: z.string().optional(),
  email: z.string().email("Insira um email válido").optional(),
});

type FormData = z.infer<typeof schema>;

interface ModalEditUserProps {
  onClose: () => void;
}

export const ModalEditUser: React.FC<ModalEditUserProps> = ({ onClose }) => {

  const { updateUser, signOut, user } = useContext(AuthContextBlog);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [avatarUrl, setAvatarUrl] = useState(
    user?.image_user ? `${API_URL}files/${user.image_user}` : ""
  );
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user?.name || "",
        email: user?.email || "",
      });
      setAvatarUrl(user?.image_user ? `${API_URL}files/${user.image_user}` : "");
    }
  }, [user, reset, API_URL]);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const image = e.target.files[0];
    if (image && (image.type === "image/jpeg" || image.type === "image/png")) {
      setPhoto(image);
      setAvatarUrl(URL.createObjectURL(image));
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const apiClientBlog = setupAPIClientBlog();
      const formData = new FormData();

      if (!user) {
        toast.error("Usuário não encontrado!");
        return;
      }

      if (photo) {
        formData.append("file", photo);
      }

      if (data.name !== user.name) {
        formData.append("name", data.name || "");
      }

      if (data.email !== user.email) {
        formData.append("email", data.email || "");
      }

      formData.append("user_id", user.id);

      const response = await apiClientBlog.put("/user/user_blog/update", formData);

      toast.success("Dados atualizados com sucesso!");

      setPhoto(null);
      updateUser({ image_user: response.data.image_user });
      onClose();
    } catch (error) {
      toast.error("Erro ao atualizar!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-5 rounded shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-3 text-black">Editar dados</h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col space-y-6 w-full max-w-md"
        >
          <label className="relative w-[120px] h-[120px] rounded-full cursor-pointer flex justify-center bg-gray-200 overflow-hidden">
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleFile}
              className="hidden"
            />
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Foto do usuário"
                width={120}
                height={120}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                <FiUpload size={30} color="#ff6700" />
              </div>
            )}
          </label>

          <Input
            styles="border-2 rounded-md h-12 px-3 w-full"
            type="text"
            placeholder="Digite seu nome completo..."
            name="name"
            error={errors.name?.message}
            register={register}
          />

          <Input
            styles="border-2 rounded-md h-12 px-3 w-full"
            type="email"
            placeholder="Digite seu email..."
            name="email"
            error={errors.email?.message}
            register={register}
          />

          <button
            type="submit"
            className="w-full px-6 py-3 bg-backgroundButton text-white rounded hover:bg-hoverButtonBackground transition duration-300"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar alterações"}
          </button>

          <button
            onClick={signOut}
            className="w-full px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300"
          >
            Sair
          </button>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-300"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};