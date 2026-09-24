import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Globe2,
  Mail,
  Phone,
  RefreshCw,
  Save,
  Send,
  Shield,
  User,
} from "lucide-react";
import {
  Button,
  Card,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@teachedo/ui/components";
import type { TeacherProfileDetails } from "../types/teacher-profile.types";

type AccountValues = {
  fullName: string;
  subjectSpecialization: string;
  phoneNumber: string;
  email: string;
  password: string;
};

export function TeacherAccountTab({
  teacher,
  isPending,
  onSubmit,
}: {
  teacher: TeacherProfileDetails;
  isPending: boolean;
  onSubmit: (values: AccountValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountValues>({
    defaultValues: {
      fullName: "",
      subjectSpecialization: "",
      phoneNumber: "",
      email: "",
      password: "",
    },
  });
  useEffect(
    () =>
      reset({
        fullName: teacher.fullName || teacher.name || "",
        subjectSpecialization:
          teacher.subjectSpecialization || teacher.subject || "",
        phoneNumber: teacher.phoneNumber || teacher.phone || "",
        email: teacher.email || "",
        password: "",
      }),
    [reset, teacher],
  );
  const input = (
    name: keyof AccountValues,
    label: string,
    icon: React.ReactNode,
    type = "text",
    description?: string,
  ) => (
    <Field data-invalid={Boolean(errors[name])}>
      <FieldLabel htmlFor={`teacher-account-${name}`}>{label}</FieldLabel>
      <FieldContent>
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <InputGroupText>{icon}</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            id={`teacher-account-${name}`}
            type={type}
            dir={
              name === "fullName" || name === "subjectSpecialization"
                ? "rtl"
                : "ltr"
            }
            {...register(
              name,
              name === "fullName" || name === "email"
                ? { required: "هذا الحقل مطلوب" }
                : undefined,
            )}
          />
        </InputGroup>
      </FieldContent>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{errors[name]?.message}</FieldError>
    </Field>
  );

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="grid gap-6 p-3 lg:grid-cols-[220px_minmax(0,1fr)]" dir="rtl">
            <div>
              <h3 className="m-0 text-sm font-bold text-text">بيانات الحساب</h3>
              <p className="m-0 mt-1 text-xs leading-relaxed text-text-muted">
                الحد الأدنى الذي يحتاجه المالك. الصورة والتخصص موثق بالفعل
                ويحملهما المدرس بنفسه أثناء التفعيل.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                {input("fullName", "الاسم الكامل", <User size={14} />)}
              </div>
              {input("email", "البريد الإلكتروني", <Mail size={14} />, "email")}
              {input(
                "phoneNumber",
                "رقم الهاتف",
                <Phone size={14} />,
                "tel",
                "اختياري",
              )}
              <div className="sm:col-span-2">
                <Field>
                  <FieldLabel htmlFor="teacher-account-address">
                    عنوان المدرس على المنصة
                  </FieldLabel>
                  <FieldContent>
                    <InputGroup data-disabled="true">
                      <InputGroupAddon align="inline-start">
                        <InputGroupText>
                          <Globe2 size={14} />
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        id="teacher-account-address"
                        value={`${teacher.fullName.toLowerCase().trim().replace(/\s+/g, "-")}.teachedo.com`}
                        readOnly
                        disabled
                        dir="ltr"
                      />
                    </InputGroup>
                    <FieldDescription>
                      لا يمكن تغييره بعد التفعيل حتى لا تتأثر روابط الطلاب.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </div>
            </div>
          </div>

          <div className="border-t border-border-subtle" />

          <div className="grid gap-6 p-3 lg:grid-cols-[220px_minmax(0,1fr)]" dir="rtl">
            <div>
              <h3 className="m-0 text-sm font-bold text-text">
                الوصول والتفعيل
              </h3>
              <p className="m-0 mt-1 text-xs leading-relaxed text-text-muted">
                المدرس يدخل بكلمة مرور مؤقتة وكامل التفعيل بنفسه. لا تحتاج إلى
                معرفة كلمة مروره أبداً.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="rounded-sm bg-info-subtle p-2 text-start">
                <p className="m-0 flex items-center justify-start gap-2 text-[13px] font-bold text-text">
                  <Shield size={15} /> كلمة المرور يملكها المدرس
                </p>
                <p className="m-0 text-xs leading-relaxed text-text-muted">
                  عيّنها بنفسه في 12 سبتمبر. لا يستطيع المالك رؤيتها، لكن يمكنه
                  إعادة التعيين.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button type="button" variant="outline">
                  <Send size={14} /> إرسال رابط إعادة تعيين
                </Button>
                <Button type="button" variant="outline">
                  <RefreshCw size={14} /> كلمة مؤقتة جديدة
                </Button>
                <Button type="submit" disabled={isPending}>
                  <Save size={14} />
                  {isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
