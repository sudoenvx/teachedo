import { useEffect, useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  Globe2,
  ImagePlus,
  KeyRound,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  PageHeader,
  PasswordInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@teachedo/ui/components";
import { useNotification } from "@/core/hooks/use_notification";
import { useGetSettings } from "@/modules/settings/api/settings.queries";
import {
  createTeacherSchema,
  type CreateTeacherFormValues,
} from "../schemas/teachers.schemas";
import { useAddTeacher } from "../api/teachers.mutations";

type WizardStep = "details" | "review";

const statusOptions = [
  { value: "active", label: "نشط" },
  { value: "trial", label: "تجريبي" },
  { value: "suspended_payment", label: "معلق للدفع" },
  { value: "inactive", label: "غير نشط" },
] as const;

const subjectOptions = [
  { value: "arabic", label: "اللغة العربية" },
  { value: "english", label: "اللغة الإنجليزية" },
  { value: "french", label: "اللغة الفرنسية" },
  { value: "mathematics", label: "الرياضيات" },
  { value: "physics", label: "الفيزياء" },
  { value: "chemistry", label: "الكيمياء" },
  { value: "biology", label: "الأحياء" },
  { value: "science", label: "العلوم العامة" },
  { value: "history", label: "التاريخ" },
  { value: "geography", label: "الجغرافيا" },
  { value: "philosophy", label: "الفلسفة والمنطق" },
  { value: "computer_science", label: "الحاسب الآلي والبرمجة" },
  { value: "islamic_studies", label: "التربية الدينية الإسلامية" },
  { value: "other", label: "تخصص آخر" },
] as const;

function formatPrice(value: number | undefined, currency: string) {
  if (value === undefined || Number.isNaN(value)) return "غير محدد";
  return `${value.toFixed(2)} ${currency} / طالب نشط / شهرياً`;
}

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("") || "م"
  );
}

export default function CreateTeacherPage() {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const addMutation = useAddTeacher();
  const { data: settings } = useGetSettings();
  const [step, setStep] = useState<WizardStep>("details");
  const [reviewData, setReviewData] = useState<CreateTeacherFormValues>();
  const [imagePreview, setImagePreview] = useState<string>();
  const currency = settings?.currency || "ج.م";
  const defaultPrice = settings?.price_per_student ?? 10;

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTeacherFormValues>({
    resolver: zodResolver(createTeacherSchema),
    defaultValues: {
      accountStatus: "active",
      pricingMode: "default",
      email: "",
      subjectSpecialization: "",
      customSubdomain: "",
    },
    mode: "onBlur",
  });

  const values = watch();

  // معالجة ملف الصورة بأمان لتفادي خطأ Overload resolution failed
  const rawImage = values.profileImage;
  const selectedImage: File | undefined =
    rawImage instanceof File
      ? rawImage
      : rawImage instanceof FileList && rawImage.length > 0
        ? rawImage[0]
        : undefined;

  useEffect(() => {
    if (!selectedImage || !(selectedImage instanceof Blob)) {
      setImagePreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedImage);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const customPrice =
    typeof values.pricePerStudent === "number" ? values.pricePerStudent : undefined;
  const effectivePrice =
    values.pricingMode === "custom" ? customPrice : defaultPrice;
  const subdomain = values.customSubdomain?.trim();
  const generatedSubdomain = values.fullName
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const submitForReview = (data: CreateTeacherFormValues) => {
    setReviewData(data);
    setStep("review");
  };

  const confirmCreate = async () => {
    if (!reviewData) return;

    const payload = {
      ...reviewData,
      pricePerStudent:
        reviewData.pricingMode === "custom"
          ? reviewData.pricePerStudent
          : undefined,
      profileImage: selectedImage,
    };

    await addMutation.mutateAsync(payload, {
      onError: (error) => notify.error(error.message),
      onSuccess: () => {
        notify.success("تم إنشاء حساب المعلم بنجاح");
        navigate("/teachers");
      },
    });
  };

  const renderInput = (
    name:
      | "fullName"
      | "username"
      | "email"
      | "phoneNumber"
      | "customSubdomain",
    label: string,
    icon: ReactNode,
    type: React.HTMLInputTypeAttribute = "text",
    description?: string,
    dir: "rtl" | "ltr" = "ltr",
  ) => {
    const error = errors[name]?.message;
    return (
      <Field data-invalid={Boolean(error)}>
        <FieldLabel htmlFor={`teacher-${name}`}>{label}</FieldLabel>
        <FieldContent>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText>{icon}</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id={`teacher-${name}`}
              type={type}
              dir={dir}
              aria-invalid={Boolean(error)}
              {...register(name)}
            />
          </InputGroup>
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError>
            {typeof error === "string" ? error : undefined}
          </FieldError>
        </FieldContent>
      </Field>
    );
  };

  const selectedSubjectLabel =
    subjectOptions.find(
      (opt) => opt.value === (reviewData?.subjectSpecialization || values.subjectSpecialization),
    )?.label || reviewData?.subjectSpecialization || values.subjectSpecialization;

  return (
    <form
      onSubmit={handleSubmit(submitForReview)}
      className="mx-auto flex w-full max-w-6xl flex-col gap-5 pb-8"
      dir="rtl"
    >
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">الرئيسية</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/teachers">المعلمون</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {step === "details" ? "إضافة معلم" : "مراجعة بيانات المعلم"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title={
          step === "details" ? "إضافة معلم جديد" : "مراجعة بيانات المعلم"
        }
        description={
          step === "details"
            ? "إنشاء الحساب، وتحديد خطة التسعير، وإعداد مساحة عمل المعلم."
            : "يرجى مراجعة البيانات المدخلة بعناية قبل تأكيد إنشاء الحساب."
        }
        actions={
          step === "details" ? (
            <>
              <Button
                type="button"
                variant="neutral"
                onClick={() => navigate(-1)}
              >
                <ArrowRight className="ms-1" /> رجوع
              </Button>
              <Button type="submit">
                <Save className="ms-1" /> مراجعة وإضافة
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="neutral"
              onClick={() => setStep("details")}
              disabled={addMutation.isPending}
            >
              <ArrowRight className="ms-1" /> تعديل البيانات
            </Button>
          )
        }
      />

      {step === "details" ? (
        /* وضع المحتوى الأساسي أولاً والمعاينة الجانبية في الجهة الأخرى */
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* قسم النماذج والبيانات */}
          <div className="flex min-w-0 flex-col gap-5">
            <Card>
              <CardHeader>
                <CardTitle>بيانات الحساب</CardTitle>
                <CardDescription>
                  هذه البيانات تُستخدم لتسجيل دخول المعلم إلى لوحة التحكم الخاصة به.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  {renderInput("fullName", "الاسم بالكامل", <User />, "text", undefined, "rtl")}
                </div>
                {renderInput("username", "اسم المستخدم", <KeyRound />, "text", undefined, "ltr")}
                {renderInput(
                  "email",
                  "البريد الإلكتروني",
                  <Mail />,
                  "email",
                  "اختياري، ومفيد في استعادة الحساب.",
                  "ltr",
                )}
                {renderInput(
                  "phoneNumber",
                  "رقم الهاتف الأساسي",
                  <Phone />,
                  "tel",
                  undefined,
                  "ltr",
                )}

                {/* اختيار مادة التخصص عبر Shadcn Select */}
                <Controller
                  name="subjectSpecialization"
                  control={control}
                  render={({ field }) => (
                    <Field data-invalid={Boolean(errors.subjectSpecialization)}>
                      <FieldLabel htmlFor="teacher-subject">التخصص والمادة</FieldLabel>
                      <FieldContent>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger id="teacher-subject">
                            <div className="flex items-center gap-2">
                              <BookOpen className="size-4 text-text-muted" />
                              <SelectValue placeholder="اختر المادة الدراسية" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {subjectOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldDescription>
                          يمكن للمعلم تعديل أو إكمال تخصصه لاحقاً.
                        </FieldDescription>
                        <FieldError>
                          {errors.subjectSpecialization?.message}
                        </FieldError>
                      </FieldContent>
                    </Field>
                  )}
                />

                <Controller
                  name="accountStatus"
                  control={control}
                  render={({ field }) => (
                    <Field data-invalid={Boolean(errors.accountStatus)}>
                      <FieldLabel>حالة الحساب</FieldLabel>
                      <FieldContent>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الحالة" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError>{errors.accountStatus?.message}</FieldError>
                      </FieldContent>
                    </Field>
                  )}
                />

                <Field data-invalid={Boolean(errors.password)}>
                  <FieldLabel htmlFor="teacher-password">
                    كلمة المرور المؤقتة
                  </FieldLabel>
                  <FieldContent>
                    <PasswordInput
                      id="teacher-password"
                      showGenerator
                      dir="ltr"
                      {...register("password")}
                      error={errors.password?.message}
                    />
                  </FieldContent>
                </Field>
                <Field data-invalid={Boolean(errors.confirmPassword)}>
                  <FieldLabel htmlFor="teacher-confirm-password">
                    تأكيد كلمة المرور
                  </FieldLabel>
                  <FieldContent>
                    <PasswordInput
                      id="teacher-confirm-password"
                      showStrength={false}
                      dir="ltr"
                      {...register("confirmPassword")}
                      error={errors.confirmPassword?.message}
                    />
                  </FieldContent>
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>صورة الملف الشخصي ومساحة العمل</CardTitle>
                <CardDescription>
                  كلاهما اختياري. سيتم رفع الصورة مع طلب إنشاء الحساب.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="teacher-profile-image">
                    صورة المعلم
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="teacher-profile-image"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        setValue("profileImage", file, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                    />
                    <FieldDescription>
                      صيغ PNG، JPG أو WEBP بحد أقصى 5 ميجابايت.
                    </FieldDescription>
                  </FieldContent>
                </Field>
                <div className="flex items-center gap-3 rounded-md border border-dashed border-border p-3 text-xs text-text-muted">
                  <ImagePlus className="size-5 shrink-0" />
                  <span className="truncate">
                    {selectedImage?.name || "لم يتم اختيار صورة بعد"}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  {renderInput(
                    "customSubdomain",
                    "النطاق الفرعي المخصص (Subdomain)",
                    <Globe2 />,
                    "text",
                    `اتركه فارغاً ليتم استخدام النطاق التلقائي: ${generatedSubdomain || "تلقائي"}.`,
                    "ltr",
                  )}
                  <p className="mt-1 text-[11px] text-text-muted">
                    سيكون رابط مساحة عمل المعلم متاحاً عبر:{" "}
                    <span dir="ltr" className="font-semibold text-text">
                      {subdomain || generatedSubdomain || "platform"}
                      .teachedo.com
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CircleDollarSign className="size-5" /> عقد التسعير
                </CardTitle>
                <CardDescription>
                  السعر الافتراضي يتم استخراجه من إعدادات الفوترة للنظام.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 sm:grid-cols-2">
                <Controller
                  name="pricingMode"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>خطة التسعير</FieldLabel>
                      <FieldContent>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">
                              السعر الافتراضي للمنصة ({defaultPrice} {currency})
                            </SelectItem>
                            <SelectItem value="custom">
                              سعر مخصص لهذا المعلم
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FieldContent>
                    </Field>
                  )}
                />
                <Field data-invalid={Boolean(errors.pricePerStudent)}>
                  <FieldLabel htmlFor="teacher-price">
                    السعر لكل طالب نشط / شهرياً
                  </FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupInput
                        id="teacher-price"
                        type="number"
                        min="0"
                        step="0.01"
                        dir="ltr"
                        disabled={values.pricingMode !== "custom"}
                        aria-invalid={Boolean(errors.pricePerStudent)}
                        {...register("pricePerStudent", {
                          valueAsNumber: true,
                        })}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>{currency}</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      {values.pricingMode === "custom"
                        ? "سيتم تثبيت هذا السعر في عقد المعلم."
                        : `يتم استخدام السعر الافتراضي الحالي (${defaultPrice} ${currency}).`}
                    </FieldDescription>
                    <FieldError>
                      {typeof errors.pricePerStudent?.message === "string"
                        ? errors.pricePerStudent.message
                        : undefined}
                    </FieldError>
                  </FieldContent>
                </Field>
              </CardContent>
            </Card>

            <Alert>
              <ShieldCheck className="size-5" />
              <AlertTitle>إنشاء آمن للحساب</AlertTitle>
              <AlertDescription>
                يتم إرسال كلمة المرور عبر اتصال مشفر ومصرح به، ويتم حفظها مشفرة بالكامل على الخادم.
              </AlertDescription>
            </Alert>
          </div>

          {/* المعاينة الجانبية في الجهة الأخرى */}
          <aside className="lg:sticky lg:top-5">
            <Card>
              <CardHeader>
                <CardTitle>معاينة الحساب</CardTitle>
                <CardDescription>يتم التحديث المباشر أثناء ملء البيانات.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-3 text-center">
                <Avatar size="lg" className="size-20">
                  {imagePreview && (
                    <AvatarImage src={imagePreview} alt="معاينة صورة المعلم" />
                  )}
                  <AvatarFallback>
                    {initials(values.fullName || "")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="m-0 font-semibold text-text">
                    {values.fullName || "اسم المعلم"}
                  </p>
                  <p className="m-0 text-xs text-text-muted">
                    {selectedSubjectLabel || "لم يتم تحديد المادة"}
                  </p>
                </div>
                <Badge
                  variant={
                    values.accountStatus === "active" ? "default" : "secondary"
                  }
                >
                  {statusOptions.find(
                    (option) => option.value === values.accountStatus,
                  )?.label || "نشط"}
                </Badge>
                <div className="w-full rounded-md bg-muted p-3 text-start text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-text-muted">الخطة</span>
                    <span className="font-medium text-text">
                      {values.pricingMode === "custom" ? "مخصصة" : "افتراضية"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-text-muted">التكلفة</span>
                    <span className="font-medium text-text">
                      {formatPrice(effectivePrice, currency)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-text-muted">مساحة العمل</span>
                    <span
                      dir="ltr"
                      className="max-w-36 truncate font-medium text-text"
                    >
                      {subdomain || generatedSubdomain || "platform"}
                      .teachedo.com
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      ) : (
        /* خطوة المراجعة والتأكيد */
        <Card>
          <CardHeader>
            <CardTitle>تأكيد بيانات حساب المعلم</CardTitle>
            <CardDescription>
              يرجى مراجعة البيانات أدناه، ثم الضغط على تأكيد الإنشاء.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border rounded-md border border-border">
              {[
                ["الاسم بالكامل", reviewData?.fullName],
                ["اسم المستخدم", reviewData?.username],
                ["البريد الإلكتروني", reviewData?.email || "لم يتم تقديمه"],
                ["رقم الهاتف الأساسي", reviewData?.phoneNumber],
                [
                  "المادة والتخصص",
                  subjectOptions.find(
                    (opt) => opt.value === reviewData?.subjectSpecialization,
                  )?.label || reviewData?.subjectSpecialization || "لم يتم تحديدها",
                ],
                [
                  "حالة الحساب",
                  statusOptions.find(
                    (option) => option.value === reviewData?.accountStatus,
                  )?.label,
                ],
                [
                  "خطة التسعير",
                  reviewData?.pricingMode === "custom"
                    ? `مخصصة — ${formatPrice(typeof reviewData.pricePerStudent === "number" ? reviewData.pricePerStudent : undefined, currency)}`
                    : `افتراضية — ${formatPrice(defaultPrice, currency)}`,
                ],
                [
                  "النطاق الفرعي (Workspace)",
                  `${reviewData?.customSubdomain || generatedSubdomain || "platform"}.teachedo.com`,
                ],
                [
                  "صورة المعلم",
                  selectedImage ? selectedImage.name : "لم يتم تقديم صورة",
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_1fr] sm:gap-4"
                >
                  <dt className="text-xs text-text-muted">{label}</dt>
                  <dd
                    className="m-0 break-words text-sm font-medium text-text"
                    dir={
                      label?.includes("النطاق") ||
                      label?.includes("المستخدم") ||
                      label?.includes("البريد") ||
                      label?.includes("الهاتف")
                        ? "ltr"
                        : undefined
                    }
                  >
                    {value || "غير محدد"}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button
              type="button"
              variant="neutral"
              onClick={() => setStep("details")}
              disabled={addMutation.isPending}
            >
              العودة للتعديل
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={confirmCreate}
              disabled={addMutation.isPending}
            >
              <CheckCircle2 className="ms-1" />{" "}
              {addMutation.isPending ? "جارٍ إنشاء الحساب..." : "تأكيد وإنشاء"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </form>
  );
}