import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  FileText,
  Globe2,
  GraduationCap,
  ImagePlus,
  MapPin,
  Plus,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Progress,
  Separator,
} from "@teachedo/ui/components";
import { ToggleGroup } from "@teachedo/ui/legacy";
import { useNotification } from "@/core/hooks/use_notification";
import { useCreateGroup } from "@/modules/groups/api/groups.mutations";
import { useCreateStudent } from "@/modules/students/api/students.mutations";
import type { CreateStudentInput } from "@/modules/students/types/student.types";
import {
  useCompleteTeacherOnboarding,
  type TeacherOnboardingPayload,
} from "../api/auth.mutations";
import {
  useTeacherMe,
  useTeacherSubjects,
  useTeacherSubdomainAvailability,
} from "../api/auth.queries";
import { useOnboardingPolicy } from "../api/policies.queries";

const مراحل = [
  { العنوان: "بياناتك", الوصف: "معلومات الحساب والصورة", icon: Users },
  { العنوان: "ما تدرّس", الوصف: "المواد والصفوف", icon: BookOpen },
  {
    العنوان: "هويتك التعليمية",
    الوصف: "الاسم المشهور والنطاق",
    icon: Sparkles,
  },
  { العنوان: "أول مجموعة", الوصف: "اختياري الآن", icon: GraduationCap },
  { العنوان: "طلابك", الوصف: "أضفهم أو تخطَّ", icon: Users },
];

const مراحل_الدراسة = [
  { value: "primary-1", label: "الأول الابتدائي" },
  { value: "primary-2", label: "الثاني الابتدائي" },
  { value: "primary-3", label: "الثالث الابتدائي" },
  { value: "primary-4", label: "الرابع الابتدائي" },
  { value: "primary-5", label: "الخامس الابتدائي" },
  { value: "primary-6", label: "السادس الابتدائي" },
  { value: "preparatory-1", label: "الأول الإعدادي" },
  { value: "preparatory-2", label: "الثاني الإعدادي" },
  { value: "preparatory-3", label: "الثالث الإعدادي" },
  { value: "secondary-1", label: "الأول الثانوي" },
  { value: "secondary-2", label: "الثاني الثانوي" },
  { value: "secondary-3", label: "الثالث الثانوي" },
];

const schema = z.object({
  fullName: z.string().trim().min(2, "اكتب اسمك الكامل"),
  username: z
    .string()
    .trim()
    .min(3, "اسم المستخدم يجب أن يتكون من 3 أحرف على الأقل"),
  email: z
    .string()
    .email("البريد الإلكتروني غير صحيح")
    .or(z.literal(""))
    .optional(),
  phoneNumber: z.string().trim().min(7, "أدخل رقم هاتف صحيح"),
  famousName: z.string().trim().max(120, "الاسم المشهور طويل جداً").optional(),
  customSubdomain: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/,
      "استخدم حروفاً إنجليزية صغيرة وأرقاماً وشرطة فقط",
    )
    .or(z.literal(""))
    .optional(),
});

type Values = z.infer<typeof schema>;
type StudentDraft = { fullName: string; phoneNumber: string };
type OnboardingState = { completed: string[]; skipped: string[] };

function الحقول({
  label,
  error,
  children,
  description,
}: {
  label: string;
  error?: unknown;
  children: ReactNode;
  description?: string;
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        {children}
        {description && <FieldDescription>{description}</FieldDescription>}
        <FieldError>{typeof error === "string" ? error : undefined}</FieldError>
      </FieldContent>
    </Field>
  );
}

function تحويل_المراحل(values: string[]) {
  return values.map((value) => {
    const [stageGroup, grade] = value.split("-") as [
      "primary" | "preparatory" | "secondary",
      string,
    ];
    return { stageGroup, gradeNumber: Number(grade) };
  });
}

export default function TeacherOnboardingPage() {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const {
    data: teacher,
    isLoading: teacherLoading,
    isError: teacherError,
  } = useTeacherMe();
  const { data: subjects, isLoading: subjectsLoading } = useTeacherSubjects();
  const { data: policy, isLoading: policyLoading } = useOnboardingPolicy();
  const complete = useCompleteTeacherOnboarding();
  const createGroup = useCreateGroup();
  const createStudent = useCreateStudent();
  const [step, setStep] = useState(0);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [teachingMode, setTeachingMode] = useState("both");
  const [profileImage, setProfileImage] = useState<File>();
  const [imagePreview, setImagePreview] = useState<string>();
  const [addGroup, setAddGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupFee, setGroupFee] = useState("");
  const [groupCapacity, setGroupCapacity] = useState("");
  const [students, setStudents] = useState<StudentDraft[]>([]);
  const [accepted, setAccepted] = useState(false);
  const {
    register,
    watch,
    reset,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", famousName: "" },
  });
  const values = watch();
  const subdomain = (values.customSubdomain || "").trim().toLowerCase();
  const availability = useTeacherSubdomainAvailability(subdomain);

  useEffect(() => {
    if (teacher)
      reset({
        fullName: teacher.fullName || "",
        username: teacher.username || "",
        email: teacher.email || "",
        phoneNumber: teacher.phoneNumber || "",
        famousName: teacher.famousName || "",
        customSubdomain: teacher.customSubdomain || "",
      });
  }, [reset, teacher]);

  useEffect(() => {
    if (!profileImage) {
      setImagePreview(undefined);
      return;
    }
    const url = URL.createObjectURL(profileImage);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImage]);

  const selectedSubjects = useMemo(
    () =>
      subjects?.filter((subject) =>
        selectedSubjectIds.includes(String(subject.id)),
      ) || [],
    [selectedSubjectIds, subjects],
  );
  const selectedSubjectLabels = [
    ...selectedSubjects.map((subject) => subject.name),
    ...customSubjects,
  ];
  const canUseSubdomain =
    !subdomain ||
    Boolean(availability.data?.available) ||
    subdomain === teacher?.customSubdomain;

  const addCustomSubject = () => {
    const value = newSubject.trim();
    if (
      !value ||
      customSubjects.includes(value) ||
      selectedSubjectLabels.includes(value)
    )
      return;
    setCustomSubjects((current) => [...current, value]);
    setNewSubject("");
  };

  const removeCustomSubject = (value: string) =>
    setCustomSubjects((current) =>
      current.filter((subject) => subject !== value),
    );

  const updateStudent = (
    index: number,
    key: keyof StudentDraft,
    value: string,
  ) =>
    setStudents((current) =>
      current.map((student, studentIndex) =>
        studentIndex === index ? { ...student, [key]: value } : student,
      ),
    );

  const finish = async (formValues: Values) => {
    if (!policy || !accepted) {
      notify.error("يرجى قراءة الشروط والموافقة عليها");
      return;
    }
    if (!selectedSubjectIds.length && !customSubjects.length) {
      notify.error("اختر مادة واحدة على الأقل");
      setStep(1);
      return;
    }
    if (!selectedStages.length) {
      notify.error("اختر صفاً واحداً على الأقل");
      setStep(1);
      return;
    }
    if (!canUseSubdomain) {
      notify.error("هذا النطاق الفرعي غير متاح");
      setStep(2);
      return;
    }

    const payload: TeacherOnboardingPayload = {
      ...formValues,
      email: formValues.email || null,
      subjectIds: selectedSubjectIds.map(Number),
      subjectId: Number(selectedSubjectIds[0] || 1),
      customSubjects,
      stages: تحويل_المراحل(selectedStages),
      famousName: formValues.famousName || null,
      teachingMode: teachingMode as "center" | "institute" | "both",
      customSubdomain: formValues.customSubdomain || "",
      policyKey: policy.key,
      policyVersion: policy.version,
      profileImage,
    };

    const completed: string[] = [
      "بيانات الحساب",
      "المواد والصفوف",
      "الهوية التعليمية",
    ];
    const skipped: string[] = [];
    try {
      await complete.mutateAsync(payload);
      let createdGroupId: number | undefined;
      if (addGroup && groupName.trim()) {
        try {
          const group = (await createGroup.mutateAsync({
            className: groupName.trim(),
            gradeLevel: 'غير محدد',
            monthlyPrice: groupFee ? Number(groupFee) : null,
            maxCapacity: groupCapacity ? Number(groupCapacity) : null,
          })) as { id?: number };
          createdGroupId = group?.id;
          if (createdGroupId) completed.push("المجموعة الأولى");
          else skipped.push("المجموعة الأولى");
        } catch {
          skipped.push("المجموعة الأولى");
        }
      } else skipped.push("المجموعة الأولى");

      const validStudents = students.filter((student) =>
        student.fullName.trim(),
      );
      if (validStudents.length) {
        let added = 0;
        for (const student of validStudents) {
          try {
            const studentPayload: CreateStudentInput = {
              fullName: student.fullName.trim(),
              phoneNumber: student.phoneNumber.trim() || null,
              status: "active",
              classId: createdGroupId || null,
            };
            await createStudent.mutateAsync(studentPayload);
            added += 1;
          } catch {
            /* نعرض النتيجة الجزئية في صفحة الإتمام */
          }
        }
        if (added === validStudents.length) completed.push("الطلاب الأوائل");
        else
          skipped.push(`الطلاب الأوائل (${added} من ${validStudents.length})`);
      } else skipped.push("الطلاب الأوائل");

      notify.success("تم حفظ إعداد حسابك");
      navigate("/onboarding/complete", {
        replace: true,
        state: { completed, skipped } satisfies OnboardingState,
      });
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "تعذر حفظ إعداد الحساب",
      );
    }
  };

  const next = async () => {
    if (
      step === 0 &&
      !(await trigger(["fullName", "username", "email", "phoneNumber"]))
    )
      return;
    if (
      step === 1 &&
      ((!selectedSubjectIds.length && !customSubjects.length) ||
        !selectedStages.length)
    ) {
      notify.error("أكمل اختيار المواد والصفوف");
      return;
    }
    if (
      step === 2 &&
      (!(await trigger(["famousName", "customSubdomain"])) || !canUseSubdomain)
    ) {
      notify.error("تحقق من النطاق الفرعي ثم تابع");
      return;
    }
    if (step === 3 && addGroup && !groupName.trim()) {
      notify.error("اكتب اسم المجموعة أو تخطَّ الخطوة");
      return;
    }
    if (step < 4) setStep((current) => current + 1);
    else void handleSubmit(finish)();
  };

  if (
    teacherLoading ||
    subjectsLoading ||
    policyLoading ||
    !teacher ||
    !subjects ||
    !policy
  )
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-canvas text-sm text-text-muted"
        dir="rtl"
      >
        جارٍ تجهيز خطوات إعداد حسابك...
      </div>
    );
  if (teacherError)
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-canvas text-sm text-destructive"
        dir="rtl"
      >
        تعذر تحميل بيانات الحساب.
      </div>
    );
  const currentStage = مراحل[step]!;

  const preview = [
    <div className="flex flex-col items-center text-center" key="identity">
      <Avatar size="lg" className="size-24">
          {(imagePreview || teacher.profilePictureUrl) && <AvatarImage src={imagePreview || teacher.profilePictureUrl || undefined} alt="صورة المعلم" />}
        <AvatarFallback>{(values.fullName || "م").slice(0, 1)}</AvatarFallback>
      </Avatar>
      <p className="mt-4 font-bold text-text">
        {values.fullName || "اسم المعلم"}
      </p>
      <p className="text-xs text-text-muted">
        {values.username || "اسم المستخدم"}
      </p>
      <Badge className="mt-3">حساب معلم</Badge>
    </div>,
    <div key="teaching" className="space-y-4">
      <PreviewRow
        icon={<BookOpen />}
        label="المواد"
        value={selectedSubjectLabels.join("، ") || "لم تختر مادة بعد"}
      />
      <PreviewRow
        icon={<GraduationCap />}
        label="الصفوف"
        value={
          selectedStages.length
            ? `${selectedStages.length} صفوف مختارة`
            : "لم تختر صفاً بعد"
        }
      />
      <PreviewRow
        icon={<MapPin />}
        label="مكان التدريس"
        value={
          teachingMode === "center"
            ? "سنتر"
            : teachingMode === "institute"
              ? "معهد"
              : "سنتر ومعهد"
        }
      />
    </div>,
    <div key="identity-preview" className="space-y-4">
      <PreviewRow
        icon={<Sparkles />}
        label="الاسم المشهور"
        value={values.famousName || "لم تضف اسماً مشهوراً"}
      />
      <PreviewRow
        icon={<Globe2 />}
        label="النطاق"
        value={`${subdomain || "teacher"}.teachedo.com`}
      />
      <div
        className={`rounded-lg p-3 text-xs ${canUseSubdomain ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning-foreground"}`}
      >
        {subdomain.length >= 3
          ? canUseSubdomain
            ? "النطاق متاح"
            : "نتحقق من توفر النطاق"
          : "اكتب نطاقاً قصيراً وسهل التذكر"}
      </div>
    </div>,
    <div key="group-preview" className="space-y-4">
      <PreviewRow
        icon={<GraduationCap />}
        label="المجموعة"
        value={
          addGroup ? groupName || "لم تكتب اسم المجموعة" : "سأتولى ذلك لاحقاً"
        }
      />
      <PreviewRow
        icon={<FileText />}
        label="الرسوم"
        value={groupFee ? `${groupFee} جنيه` : "غير محددة"}
      />
    </div>,
    <div key="students-preview" className="space-y-4">
      <PreviewRow
        icon={<Users />}
        label="عدد الطلاب"
        value={
          students.filter((student) => student.fullName.trim()).length
            ? `${students.filter((student) => student.fullName.trim()).length} طلاب`
            : "لم تضف طلاباً بعد"
        }
      />
      <p className="text-xs leading-7 text-text-muted">
        يمكنك إضافة الطلاب الآن أو البدء بمساحتك وإضافتهم لاحقاً.
      </p>
    </div>,
  ][step];

  return (
    <div className="min-h-screen bg-canvas px-4 py-6 sm:px-6 lg:px-8" dir="rtl">
      <div
        dir="ltr"
        className="mx-auto grid max-w-[1440px] items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)_250px]"
      >
        <aside dir="rtl" className="order-1 lg:sticky lg:top-6">
          <Card>
            <CardHeader>
              <CardTitle>معاينة مساحتك</CardTitle>
              <CardDescription>تتحدث مع كل خطوة.</CardDescription>
            </CardHeader>
            <CardContent>{preview}</CardContent>
          </Card>
        </aside>
        <main dir="rtl" className="order-2 min-w-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">
                    {currentStage.العنوان}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {currentStage.الوصف}
                  </CardDescription>
                </div>
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary-subtle text-primary">
                  {(() => {
                    const Icon = currentStage.icon;
                    return <Icon />;
                  })()}
                </span>
              </div>
              <Progress
                value={((step + 1) / مراحل.length) * 100}
                className="mt-5"
              />
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void next();
                }}
                className="space-y-6"
              >
                {step === 0 && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      {الحقول({
                        label: "الاسم الكامل",
                        error: errors.fullName?.message,
                        children: <Input dir="rtl" {...register("fullName")} />,
                      })}
                    </div>
                    {الحقول({
                      label: "اسم المستخدم",
                      error: errors.username?.message,
                      children: <Input dir="ltr" {...register("username")} />,
                    })}
                    {الحقول({
                      label: "البريد الإلكتروني",
                      error: errors.email?.message,
                      description: "اختياري، ويمكن استخدامه لاستعادة الحساب.",
                      children: (
                        <Input type="email" dir="ltr" {...register("email")} />
                      ),
                    })}
                    {الحقول({
                      label: "رقم الهاتف",
                      error: errors.phoneNumber?.message,
                      children: (
                        <Input
                          type="tel"
                          dir="ltr"
                          placeholder="01xxxxxxxxx"
                          {...register("phoneNumber")}
                        />
                      ),
                    })}
                    <Field>
                      <FieldLabel htmlFor="profile-image">
                        الصورة الشخصية
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id="profile-image"
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={(event) =>
                            setProfileImage(event.target.files?.[0])
                          }
                        />
                        <FieldDescription>
                          اختياري، بصيغة JPG أو PNG أو WEBP.
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                    <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-3 text-xs text-text-muted">
                      <ImagePlus className="size-5" />
                      {profileImage?.name || "لم تختر صورة بعد"}
                    </div>
                  </div>
                )}
                {step === 1 && (
                  <div className="space-y-7">
                    <Field>
                      <FieldLabel>المواد التي تدرّسها</FieldLabel>
                      <FieldContent>
                        <ToggleGroup
                          multiple
                          size="md"
                          options={subjects.map((subject) => ({
                            label: subject.name,
                            value: String(subject.id),
                          }))}
                          value={selectedSubjectIds}
                          onChange={(value) =>
                            setSelectedSubjectIds(
                              Array.isArray(value) ? value : [value],
                            )
                          }
                          className="flex w-full flex-wrap justify-start bg-transparent p-0"
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                          {customSubjects.map((subject) => (
                            <Badge key={subject} variant="secondary">
                              {subject}
                              <button
                                type="button"
                                aria-label={`حذف ${subject}`}
                                onClick={() => removeCustomSubject(subject)}
                              >
                                <X className="size-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </FieldContent>
                    </Field>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        value={newSubject}
                        onChange={(event) => setNewSubject(event.target.value)}
                        placeholder="لم تجد المادة؟ اكتبها هنا"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={addCustomSubject}
                      >
                        <Plus /> إضافة مادة
                      </Button>
                    </div>
                    <Field>
                      <FieldLabel>الصفوف التي تدرّسها</FieldLabel>
                      <FieldContent>
                        <ToggleGroup
                          multiple
                          size="md"
                          options={مراحل_الدراسة}
                          value={selectedStages}
                          onChange={(value) =>
                            setSelectedStages(
                              Array.isArray(value) ? value : [value],
                            )
                          }
                          className="flex w-full flex-wrap justify-start bg-transparent p-0"
                        />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>أين تدرّس؟</FieldLabel>
                      <FieldContent>
                        <ToggleGroup
                          size="md"
                          options={[
                            { label: "في سنتر", value: "center" },
                            { label: "في معهد", value: "institute" },
                            { label: "سنتر ومعهد", value: "both" },
                          ]}
                          value={teachingMode}
                          onChange={(value) => setTeachingMode(String(value))}
                          className="w-full justify-start bg-transparent p-0"
                        />
                      </FieldContent>
                    </Field>
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-5">
                    {الحقول({
                      label: "اسمك المشهور",
                      description: "مثال: عملاق الفيزياء أو ملك الرياضيات.",
                      error: errors.famousName?.message,
                      children: (
                        <Input
                          placeholder="عملاق الفيزياء"
                          {...register("famousName")}
                        />
                      ),
                    })}
                    {الحقول({
                      label: "النطاق الفرعي",
                      description: "لن تتمكن من تغييره لاحقاً، اختره بعناية.",
                      error: errors.customSubdomain?.message,
                      children: (
                        <div className="flex items-center gap-2">
                          <Input
                            dir="ltr"
                            placeholder="teacher-name"
                            {...register("customSubdomain")}
                          />
                          <span
                            dir="ltr"
                            className="shrink-0 text-xs text-text-muted"
                          >
                            .teachedo.com
                          </span>
                        </div>
                      ),
                    })}
                    <div
                      className={`flex items-center gap-2 rounded-lg p-3 text-xs ${subdomain.length < 3 ? "bg-muted text-text-muted" : availability.isFetching ? "bg-muted text-text-muted" : availability.data?.available || subdomain === teacher.customSubdomain ? "bg-success-subtle text-success" : "bg-destructive/10 text-destructive"}`}
                    >
                      {subdomain.length < 3
                        ? "اكتب ثلاثة أحرف على الأقل للتحقق من التوفر"
                        : availability.isFetching
                          ? "جارٍ التحقق من توفر النطاق..."
                          : availability.data?.available ||
                              subdomain === teacher.customSubdomain
                            ? "النطاق متاح ويمكن استخدامه"
                            : "هذا النطاق مستخدم بالفعل"}
                    </div>
                    <Alert>
                      <Globe2 />
                      <AlertTitle>ملاحظة مهمة</AlertTitle>
                      <AlertDescription>
                        سيكون هذا عنوان مساحتك التعليمية ولا يمكن تغييره بعد
                        الإكمال.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
                {step === 3 && (
                  <div className="space-y-5">
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldLabel>إضافة أول مجموعة الآن</FieldLabel>
                        <FieldDescription>
                          يمكنك تخطي هذه الخطوة وإنشاء المجموعة من لوحة التحكم
                          لاحقاً.
                        </FieldDescription>
                      </FieldContent>
                      <Checkbox
                        checked={addGroup}
                        onCheckedChange={(checked) =>
                          setAddGroup(Boolean(checked))
                        }
                      />
                    </Field>
                    {addGroup && (
                      <div className="grid gap-5 rounded-lg border border-border p-4 sm:grid-cols-2">
                        {الحقول({
                          label: "اسم المجموعة",
                          children: (
                            <Input
                              value={groupName}
                              onChange={(event) =>
                                setGroupName(event.target.value)
                              }
                              placeholder="مجموعة الصف الثالث الثانوي"
                            />
                          ),
                        })}
                        {الحقول({
                          label: "الرسوم الشهرية",
                          description: "اختياري.",
                          children: (
                            <Input
                              type="number"
                              min="0"
                              value={groupFee}
                              onChange={(event) =>
                                setGroupFee(event.target.value)
                              }
                            />
                          ),
                        })}
                        {الحقول({
                          label: "الحد الأقصى للطلاب",
                          description: "اختياري.",
                          children: (
                            <Input
                              type="number"
                              min="1"
                              value={groupCapacity}
                              onChange={(event) =>
                                setGroupCapacity(event.target.value)
                              }
                            />
                          ),
                        })}
                      </div>
                    )}
                  </div>
                )}
                {step === 4 && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="m-0 font-bold text-text">
                          إضافة الطلاب الآن
                        </h3>
                        <p className="m-0 mt-1 text-xs text-text-muted">
                          اختيارية ويمكنك العودة إليها لاحقاً.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setStudents((current) => [
                            ...current,
                            { fullName: "", phoneNumber: "" },
                          ])
                        }
                      >
                        <Plus /> إضافة طالب
                      </Button>
                    </div>
                    {students.length === 0 && (
                      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-text-muted">
                        لم تتم إضافة أي طالب بعد.
                      </div>
                    )}
                    {students.map((student, index) => (
                      <div
                        key={index}
                        className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-[1fr_1fr_auto]"
                      >
                        <Input
                          value={student.fullName}
                          onChange={(event) =>
                            updateStudent(index, "fullName", event.target.value)
                          }
                          placeholder="اسم الطالب"
                        />
                        <Input
                          dir="ltr"
                          value={student.phoneNumber}
                          onChange={(event) =>
                            updateStudent(
                              index,
                              "phoneNumber",
                              event.target.value,
                            )
                          }
                          placeholder="رقم الهاتف"
                        />
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label="حذف الطالب"
                          onClick={() =>
                            setStudents((current) =>
                              current.filter(
                                (_, studentIndex) => studentIndex !== index,
                              ),
                            )
                          }
                        >
                          <X />
                        </Button>
                      </div>
                    ))}
                    <Separator />
                    <label className="flex cursor-pointer items-start gap-3 text-xs leading-6 text-text">
                      <Checkbox
                        checked={accepted}
                        onCheckedChange={(checked) =>
                          setAccepted(Boolean(checked))
                        }
                      />{" "}
                      أوافق على قراءة الشروط والأحكام والالتزام بها.
                    </label>
                    {policy && (
                      <details className="rounded-lg bg-muted p-3 text-xs">
                        <summary className="cursor-pointer font-semibold">
                          عرض الشروط والأحكام
                        </summary>
                        <p className="mt-3 whitespace-pre-line leading-7 text-text-muted">
                          {policy.content}
                        </p>
                      </details>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-border pt-5">
                  <Button
                    type="button"
                    variant="neutral"
                    disabled={step === 0 || complete.isPending}
                    onClick={() => setStep((current) => current - 1)}
                  >
                    {step > 0 && <ArrowRight />} السابق
                  </Button>
                  <Button type="submit" disabled={complete.isPending}>
                    {step < 4 ? (
                      <>
                        التالي <ArrowLeft />
                      </>
                    ) : (
                      <>
                        {complete.isPending
                          ? "جارٍ حفظ الحساب..."
                          : "إكمال الإعداد"}{" "}
                        <CheckCircle2 />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
        <aside dir="rtl" className="order-3 lg:sticky lg:top-6">
          <Card>
            <CardHeader>
              <CardTitle>خطوات الإعداد</CardTitle>
              <CardDescription>أكمل ما يناسبك الآن.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {مراحل.map((item, index) => {
                const Icon = item.icon;
                const done = index < step;
                const active = index === step;
                return (
                  <button
                    key={item.العنوان}
                    type="button"
                    onClick={() => index <= step && setStep(index)}
                    className={`flex w-full items-center gap-3 rounded-lg p-3 text-right transition-colors ${active ? "bg-primary text-primary-foreground" : done ? "bg-success-subtle text-success" : "text-text-muted hover:bg-muted"}`}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-current/25">
                      {done ? (
                        <Check className="size-4" />
                      ) : (
                        <Icon className="size-4" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold">
                        {item.العنوان}
                      </span>
                      <span
                        className={`mt-1 block text-[10px] ${active ? "text-primary-foreground/75" : "text-text-muted"}`}
                      >
                        {item.الوصف}
                      </span>
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function PreviewRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="m-0 text-[11px] text-text-muted">{label}</p>
        <p className="m-0 mt-1 break-words text-xs font-semibold text-text">
          {value}
        </p>
      </div>
    </div>
  );
}
