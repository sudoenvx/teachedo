import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  GraduationCap,
  Layers3,
  Pencil,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Input, Select } from "@teachedo/ui";
import { z } from "zod";
import { useNotification } from "@/core/hooks/use_notification";
import { useTeacherMe, useTeacherSubjects } from "../api/auth.queries";
import {
  useCompleteTeacherOnboarding,
  type TeacherOnboardingPayload,
} from "../api/auth.mutations";
import { useOnboardingPolicy } from "../api/policies.queries";
import { SubjectIcon } from "../subject-icons";

const STAGE_OPTIONS = [
  {
    stageGroup: "primary" as const,
    label: "الابتدائي",
    description: "الصفوف من الأول إلى السادس",
    grades: [1, 2, 3, 4, 5, 6],
  },
  {
    stageGroup: "preparatory" as const,
    label: "الإعدادي",
    description: "الأول والثاني والثالث الإعدادي",
    grades: [1, 2, 3],
  },
  {
    stageGroup: "secondary" as const,
    label: "الثانوي",
    description: "الأول والثاني والثالث الثانوي",
    grades: [1, 2, 3],
  },
];
const schema = z.object({
  fullName: z.string().trim().min(2, "اكتب اسمك الكامل"),
  phoneNumber: z.string().optional(),
  subjectSpecialization: z.string().optional(),
});
type Values = z.infer<typeof schema>;
type SelectedStage = {
  stageGroup: "primary" | "preparatory" | "secondary";
  gradeNumber: number;
};

function renderPolicy(content: string) {
  return content.split(/\n\n+/).map((block, index) => {
    const heading = block.match(/^#{1,3}\s+(.+)$/m);
    const text = block.replace(/^#{1,3}\s+.+$/m, "").trim();
    return (
      <section
        key={index}
        className="border-b border-border-subtle pb-4 last:border-0"
      >
        <h3 className="text-[13px] font-bold text-text">
          {heading?.[1] || "معلومات مهمة"}
        </h3>
        {text && (
          <p className="mt-1 whitespace-pre-line text-[12px] leading-7 text-text-muted">
            {text}
          </p>
        )}
      </section>
    );
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
  const completeMutation = useCompleteTeacherOnboarding();
  const [step, setStep] = useState(0);
  const [selectedStages, setSelectedStages] = useState<SelectedStage[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [editingField, setEditingField] = useState<
    "fullName" | "phoneNumber" | "subjectSpecialization" | null
  >(null);
  const [editingValue, setEditingValue] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    reset,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: teacher?.fullName || "",
      phoneNumber: "",
      subjectSpecialization: "",
    },
  });

  useEffect(() => {
    if (teacher)
      reset({
        fullName: teacher.fullName,
        phoneNumber: teacher.phoneNumber || "",
        subjectSpecialization: teacher.subjectSpecialization || "",
      });
  }, [reset, teacher]);

  useEffect(() => {
    if (teacher && !teacher.onboardingRequired)
      navigate("/dashboard", { replace: true });
    if (teacherError) navigate("/login", { replace: true });
  }, [navigate, teacher, teacherError]);

  const toggleStage = (
    stageGroup: SelectedStage["stageGroup"],
    gradeNumber: number,
  ) =>
    setSelectedStages((current) =>
      current.some(
        (item) =>
          item.stageGroup === stageGroup && item.gradeNumber === gradeNumber,
      )
        ? current.filter(
            (item) =>
              !(
                item.stageGroup === stageGroup &&
                item.gradeNumber === gradeNumber
              ),
          )
        : [...current, { stageGroup, gradeNumber }],
    );
  const selectedLabels = useMemo(
    () =>
      selectedStages.map(
        (item) =>
          `${STAGE_OPTIONS.find((option) => option.stageGroup === item.stageGroup)?.label} - الصف ${item.gradeNumber}`,
      ),
    [selectedStages],
  );
  const beginEdit = (
    field: "fullName" | "phoneNumber" | "subjectSpecialization",
  ) => {
    setEditingField(field);
    setEditingValue(getValues(field) || "");
  };
  const saveEdit = () => {
    if (!editingField) return;
    setValue(editingField, editingValue, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setEditingField(null);
  };
  const finish = async (values: Values) => {
    if (!policy || !accepted)
      return notify.error("يجب قراءة الشروط والموافقة عليها");
    const payload: TeacherOnboardingPayload = {
      ...values,
      phoneNumber: values.phoneNumber || null,
      subjectSpecialization: values.subjectSpecialization || null,
      subjectId: Number(selectedSubjectId),
      stages: selectedStages,
      policyKey: policy.key,
      policyVersion: policy.version,
    };
    try {
      await completeMutation.mutateAsync(payload);
      notify.success("اكتمل إعداد حسابك");
      navigate("/onboarding/complete", { replace: true });
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "تعذر إكمال الإعداد",
      );
    }
  };
  if (
    teacherLoading ||
    policyLoading ||
    subjectsLoading ||
    !teacher ||
    !policy ||
    !subjects
  )
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-[12px] text-text-muted">
        جاري تجهيز خطوات الإعداد...
      </div>
    );
  const steps = ["بياناتك", "مراحل التدريس", "مراجعة البيانات"];
  return (
    <div className="min-h-screen bg-canvas" dir="rtl">
      <header className="border-b border-border-subtle bg-surface sticky top-0">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-secondary-hover text-white">
              <GraduationCap size={17} />
            </span>
            <span className="text-[14px] font-bold text-text">EDU-HUB</span>
          </div>
          <span className="text-[11px] text-text">إعداد الحساب التعليمي</span>
        </div>
        <div className="h-0.5 bg-neutral-100">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{
              width: `${Math.min(((step + 1) / steps.length) * 100, 100)}%`,
            }}
          />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <div className="mb-8">
          <p className="text-[11px] font-semibold text-primary">
            مرحباً بك، {teacher.fullName}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-text">
            لنجهّز حسابك
          </h1>
          <p className="mt-2 text-[13px] text-text-muted">
            أكمل الخطوات التالية لتبدأ بإدارة مساحتك التعليمية.
          </p>
        </div>
        <div className="mb-7 flex items-center gap-2 overflow-x-auto pb-1">
          {steps.map((label, index) => (
            <div key={label} className="flex shrink-0 items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${index <= step ? "bg-primary text-primary-foreground" : "bg-neutral-200 text-text-muted"}`}
              >
                {index < step ? <Check size={13} /> : index + 1}
              </span>
              <span
                className={`text-[11px] ${index === step ? "font-bold text-text" : "text-text-muted"}`}
              >
                {label}
              </span>
              {index < steps.length - 1 && (
                <span className="mx-1 h-px w-5 bg-border sm:w-12" />
              )}
            </div>
          ))}
        </div>
        <Card>
          <form onSubmit={handleSubmit(finish)}>
            {step === 0 && (
              <Step
                title="بياناتك المهنية"
                description="أكد بياناتك الأساسية حتى تظهر مساحتك التعليمية بصورة احترافية."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Input
                      // label="الاسم الكامل"
                      // variant="outline"
                      // leadingIcon={<UserRound size={15} />}
                      defaultValue={teacher.fullName}
                      {...register("fullName")}
                      // error={errors.fullName?.message}
                    />
                  </div>
                  <Input
                    // label="رقم الهاتف"
                    // size="lg"
                    // variant="outline"
                    dir="ltr"
                    placeholder="01xxxxxxxxx"
                    {...register("phoneNumber")}
                  />
                  <div>
                    <Select
                      // side='top'
                      // searchable
                      // label="المادة التي تدرّسها"
                      value={selectedSubjectId}
                      // onChange={(value) => {
                      //   setSelectedSubjectId(value)
                      //   setValue('subjectSpecialization', subjects.find((subject) => String(subject.id) === value)?.name || '')
                      // }}
                      // options={subjects.map((subject) => ({ value: String(subject.id), label: subject.name, icon: <SubjectIcon icon={subject.icon} className="h-4 w-4" /> }))}
                      // placeholder="اختر المادة"
                      // size="lg"
                    />
                  </div>
                </div>
              </Step>
            )}
            {step === 1 && (
              <Step
                title="مراحل التدريس"
                description="اختر كل الصفوف التي تدرّسها. يمكنك تعديلها لاحقاً."
              >
                <div className="flex flex-col gap-3">
                  {STAGE_OPTIONS.map((stage) => (
                    <div
                      key={stage.stageGroup}
                      className="rounded-sm border border-border-subtle p-3"
                    >
                      <div className="flex items-start gap-3">
                        <Layers3 size={17} className="mt-0.5 text-primary" />
                        <div>
                          <h3 className="text-[13px] font-bold text-text">
                            {stage.label}
                          </h3>
                          <p className="mt-0.5 text-[11px] text-text-muted">
                            {stage.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {stage.grades.map((grade) => {
                          const selected = selectedStages.some(
                            (item) =>
                              item.stageGroup === stage.stageGroup &&
                              item.gradeNumber === grade,
                          );
                          return (
                            <button
                              key={grade}
                              type="button"
                              onClick={() =>
                                toggleStage(stage.stageGroup, grade)
                              }
                              className={`flex items-center gap-2 rounded-sm  px-3 py-1 text-[11px] font-semibold transition-colors ${selected ? "bg-primary-subtle text-primary" : "border-border bg-neutral-100 text-text-muted hover:border-primary/50 hover:text-text"}`}
                            >
                              {selected && (
                                <Check
                                  size={11}
                                  strokeWidth={3}
                                  className={`${selected && "text-primary"}`}
                                />
                              )}

                              {stage.stageGroup === "primary"
                                ? `الصف ${grade}`
                                : `${grade} ${stage.stageGroup === "preparatory" ? "إعدادي" : "ثانوي"}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-text-muted">
                  تم اختيار {selectedStages.length} صف
                </p>
              </Step>
            )}
            {step === 2 && (
              <Step
                title="مراجعة بياناتك"
                description="راجع التفاصيل قبل الانتقال إلى الشروط والأحكام."
              >
                <div className="divide-y divide-border-subtle rounded-sm border border-border-subtle">
                  <EditableReview
                    label="الاسم"
                    field="fullName"
                    editingField={editingField}
                    editingValue={editingValue}
                    value={getValues("fullName")}
                    onEdit={beginEdit}
                    onChange={setEditingValue}
                    onSave={saveEdit}
                    onCancel={() => setEditingField(null)}
                  />
                  <EditableReview
                    label="الهاتف"
                    field="phoneNumber"
                    editingField={editingField}
                    editingValue={editingValue}
                    value={getValues("phoneNumber") || "لم تتم إضافته"}
                    onEdit={beginEdit}
                    onChange={setEditingValue}
                    onSave={saveEdit}
                    onCancel={() => setEditingField(null)}
                  />
                  <SubjectReview
                    selectedSubjectId={selectedSubjectId}
                    subjects={subjects}
                    onChange={(value) => {
                      setSelectedSubjectId(value);
                      setValue(
                        "subjectSpecialization",
                        subjects.find((subject) => String(subject.id) === value)
                          ?.name || "",
                      );
                    }}
                  />
                  <div className="p-3">
                    <p className="text-[10px] text-text-muted">مراحل التدريس</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedLabels.map((label) => (
                        <span
                          key={label}
                          className="rounded-sm bg-primary-subtle px-2 py-1 text-[10px] font-semibold text-primary"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Step>
            )}
            {step === 3 && (
              <Step
                title={policy.title}
                description="اقرأ الشروط كاملة ثم أكد موافقتك لإكمال إعداد الحساب."
              >
                <div className="rounded-sm border border-border-subtle bg-transparent">
                  <div className="max-h-[min(28rem,55vh)] space-y-4 overflow-y-auto p-4 sm:p-4">
                    {renderPolicy(policy.content)}
                  </div>
                  <div className="border-t border-border-subtle bg-surface p-4">
                    <label className="flex cursor-pointer items-start gap-2 text-[11px] font-semibold text-text">
                      <input
                        type="checkbox"
                        checked={accepted}
                        onChange={(event) => setAccepted(event.target.checked)}
                        className="mt-0.5 accent-primary"
                      />
                      أقر بأنني قرأت الشروط والأحكام وأوافق على الالتزام بها.
                    </label>
                  </div>
                </div>
              </Step>
            )}
            <div className="mt-8 flex items-center justify-between border-t border-border-subtle pt-5">
              {step > 0 ? (
                <Button
                  type="button"
                  // color="secondary"
                  // style="tint"
                  size="sm"
                  // uppercase={false}
                  // leftIcon={<ArrowRight size={14} />}
                  onClick={() => setStep(step - 1)}
                >
                  السابق
                </Button>
              ) : (
                <span />
              )}
              {step < 3 ? (
                <Button
                  type="button"
                  // color="primary"
                  // style="solid"
                  // size="md"
                  // uppercase={false}
                  // rightIcon={<ArrowLeft size={14} />}
                  onClick={() => {
                    if (step === 0 && !selectedSubjectId)
                      return notify.error("اختر مادة واحدة");
                    if (step === 1 && !selectedStages.length)
                      return notify.error("اختر مرحلة واحدة على الأقل");
                    setStep(step + 1);
                  }}
                >
                  التالي
                </Button>
              ) : (
                <Button
                  type="submit"
                  // color="primary"
                  // style="solid"
                  // size="md"
                  // uppercase={false}
                  // loading={completeMutation.isPending}
                  // rightIcon={<CheckCircle2 size={14} />}
                >
                  إكمال الإعداد
                </Button>
              )}
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}

function Step({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold text-text">{title}</h2>
      <p className="mt-1 text-[12px] leading-relaxed text-text-muted">
        {description}
      </p>
      <div className="mt-6">{children}</div>
    </section>
  );
}
function EditableReview({
  label,
  field,
  value,
  editingField,
  editingValue,
  onEdit,
  onChange,
  onSave,
  onCancel,
}: {
  label: string;
  field: "fullName" | "phoneNumber" | "subjectSpecialization";
  value: string;
  editingField: "fullName" | "phoneNumber" | "subjectSpecialization" | null;
  editingValue: string;
  onEdit: (field: "fullName" | "phoneNumber" | "subjectSpecialization") => void;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const editing = editingField === field;
  return (
    <div className="flex items-center justify-between gap-4 p-3">
      <span className="text-[10px] text-text-muted">{label}</span>
      {editing ? (
        <Input
          // size="sm"
          // variant="underline"
          value={editingValue}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onSave}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSave();
            }
            if (event.key === "Escape") onCancel();
          }}
          autoFocus
        />
      ) : (
        <button
          type="button"
          className="group flex items-center gap-2 text-[12px] font-semibold text-text"
          onClick={() => onEdit(field)}
        >
          <span>{value}</span>
          <Pencil
            size={12}
            className="text-text-muted opacity-0 transition-opacity group-hover:opacity-100"
          />
        </button>
      )}
    </div>
  );
}

function SubjectReview({
  selectedSubjectId,
  subjects,
  onChange,
}: {
  selectedSubjectId: string;
  subjects: Array<{ id: number; name: string; icon: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-3">
      <span className="text-[10px] text-text-muted">المادة</span>
      <div className="flex min-w-fit justify-start items-center gap-2">
        <Select
          value={selectedSubjectId}
          // onChange={onChange}
          options={subjects.map((subject) => ({
            value: String(subject.id),
            label: subject.name,
            icon: <SubjectIcon icon={subject.icon} className="h-3.5 w-3.5" />,
          }))}
          size="sm"
        />
      </div>
    </div>
  );
}
