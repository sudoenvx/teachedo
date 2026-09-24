import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  LockKeyhole,
  ShieldCheck,
  Users,
} from "lucide-react";
import { z } from "zod";

import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  Input,
  PasswordInput,
} from "@teachedo/ui/components";
import { useNotification } from "@/core/hooks/use_notification";
import { useAssistantLogin, useTeacherLogin } from "../api/auth.mutations";
import {
  teacherLoginSchema,
  type TeacherLoginFormValues,
} from "../schema/teacher.schema";

const features = [
  {
    icon: Users,
    title: "إدارة الطلاب",
    description: "تابع طلابك ومجموعاتك من مكان واحد.",
  },
  {
    icon: CalendarDays,
    title: "تنظيم الحصص",
    description: "أنشئ مجموعاتك وجدول حصصك بسهولة.",
  },
  {
    icon: BookOpenCheck,
    title: "محتوى تعليمي",
    description: "قدّم دروساً واختبارات تناسب طلابك.",
  },
];

function FieldInput({
  children,
  label,
  error,
}: {
  children: ReactNode;
  label: string;
  error?: unknown;
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        {children}
        <FieldError>{typeof error === "string" ? error : undefined}</FieldError>
      </FieldContent>
    </Field>
  );
}

export default function TeacherLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { notify } = useNotification();
  const teacherLogin = useTeacherLogin();
  const assistantLogin = useAssistantLogin();
  const assistant = searchParams.get("mode") === "assistant";
  const [featureIndex, setFeatureIndex] = useState(0);
  const activeFeature = features[featureIndex]!;
  const ActiveIcon = activeFeature.icon;
  const schema = assistant
    ? z.object({
        username: z.string().min(3, "اسم المستخدم غير صالح"),
        password: z.string().min(1, "كلمة المرور مطلوبة"),
      })
    : teacherLoginSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherLoginFormValues>({
    resolver: zodResolver(schema) as never,
  });

  const submit = async (values: TeacherLoginFormValues) => {
    if (assistant) {
      await assistantLogin.mutateAsync(values, {
        onSuccess: () => {
          localStorage.setItem("teacher-cpanel-role", "assistant");
          notify.success("تم تسجيل الدخول بنجاح");
          navigate(searchParams.get("redirect") || "/dashboard", {
            replace: true,
          });
        },
        onError: (error) =>
          notify.error(error.message || "بيانات الدخول غير صحيحة"),
      });
      return;
    }

    await teacherLogin.mutateAsync(values, {
      onSuccess: (result) => {
        localStorage.setItem("teacher-cpanel-role", "teacher");
        if (result.teacher.mustChangePassword) {
          navigate("/password/change", {
            replace: true,
            state: { temporaryPassword: values.password },
          });
          return;
        }
        navigate(
          result.teacher.onboardingRequired
            ? "/onboarding"
            : searchParams.get("redirect") || "/dashboard",
          { replace: true },
        );
      },
      onError: (error) =>
        notify.error(error.message || "بيانات الدخول غير صحيحة"),
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-canvas" dir="rtl">
      <main className="flex w-full items-center justify-center px-5 py-10 lg:w-1/2 lg:px-16">
        <Card className="w-full max-w-md ">
          <CardHeader className="gap-4 text-right">
            <div>
              <CardTitle className="text-lg">
                {assistant ? "دخول المساعد" : "دخول المعلم"}
              </CardTitle>
              <CardDescription className="">
                أدخل بيانات الدخول للوصول إلى مساحتك التعليمية.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(submit)}
              className="flex flex-col gap-5"
              noValidate
            >
              {assistant && (
                <Alert variant="info">
                  <ShieldCheck />
                  <AlertDescription>
                    سيتم تطبيق الصلاحيات المحددة لهذا المساعد.
                  </AlertDescription>
                </Alert>
              )}
              {FieldInput({
                label: "اسم المستخدم",
                error: errors.username?.message,
                children: (
                  <Input
                    id="login-username"
                    dir="ltr"
                    autoComplete="username"
                    placeholder="اسم المستخدم"
                    {...register("username")}
                  />
                ),
              })}
              {FieldInput({
                label: "كلمة المرور",
                error: errors.password?.message,
                children: (
                  <PasswordInput
                    id="login-password"
                    showStrength={false}
                    {...register("password")}
                  />
                ),
              })}
              <Button
                type="submit"
                size="lg"
                disabled={teacherLogin.isPending || assistantLogin.isPending}
              >
                {teacherLogin.isPending || assistantLogin.isPending
                  ? "جارٍ تسجيل الدخول..."
                  : "تسجيل الدخول"}
              </Button>
            </form>
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4 text-xs">
              <Link
                className="text-primary hover:underline"
                to={assistant ? "/login" : "/login?mode=assistant"}
              >
                {assistant ? "الدخول كمعلم" : "الدخول كمساعد"}
              </Link>
              <span className="text-text-muted">
                تواصل مع الإدارة عند الحاجة للمساعدة
              </span>
            </div>
          </CardContent>
        </Card>
      </main>

      <aside className="relative hidden overflow-hidden bg-secondary-hover p-14  lg:flex lg:w-1/2 lg:flex-col lg:justify-center">

        <div className="relative z-10 mx-auto w-full max-w-lg">
          <Badge variant="secondary" className="mb-6">
            <CheckCircle2 /> مساحة آمنة لمعلمي المنصة
          </Badge>
          <h1 className="max-w-md text-4xl text-neutral-200 font-bold leading-tight">
            كل ما تحتاجه لإدارة تعليمك في مكان واحد
          </h1>
          <p className="mt-5 max-w-md text-sm leading-8 text-white/75">
            أدر طلابك، مجموعاتك، حصصك، ومحتواك التعليمي من مساحة مصممة لتناسب
            يومك.
          </p>
          <div className="mt-10 rounded-lg  bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-neutral-600">
                <ActiveIcon className="text-neutral-300"/>
              </span>
              <div>
                <h2 className="m-0 text-base text-neutral-300 font-medium">
                  {activeFeature.title}
                </h2>
                <p className="m-0 text-sm leading-7 text-neutral-400">
                  {activeFeature.description}
                </p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              {features.map((feature, index) => (
                <button
                  key={feature.title}
                  type="button"
                  onClick={() => setFeatureIndex(index)}
                  aria-label={feature.title}
                  className={`h-1.5 rounded-full transition-all ${index === featureIndex ? "w-10 bg-white" : "w-3 bg-neutral-600"}`}
                />
              ))}
            </div>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs text-neutral-400">
            <LockKeyhole className="size-4" /> بياناتك محمية ومخصصة لمساحتك
            التعليمية.
          </div>
        </div>
      </aside>
    </div>
  );
}
