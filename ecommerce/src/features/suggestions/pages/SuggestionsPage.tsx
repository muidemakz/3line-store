import { PageShell } from '@/components/layout/PageShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppForm } from '@/components/ui/AppForm';
import { AppInput } from '@/components/ui/AppInput';
import { AppTypography } from '@/components/ui/AppTypography';
import { notifySuccess } from '@/shared/lib/toast';

export function SuggestionsPage() {
  const [form] = AppForm.useForm<{ message: string }>();

  return (
    <PageShell
      title="Suggestions"
      description="Share feedback with your SuperAdmin. Submissions will post to the suggestions API."
    >
      <AppCard>
        <AppForm
          layout="vertical"
          form={form}
          requiredMark={false}
          onFinish={() => {
            notifySuccess('Suggestion recorded locally — connect API next.');
            form.resetFields();
          }}
        >
          <AppForm.Item
            label="Your message"
            name="message"
            rules={[{ required: true, message: 'Enter a suggestion' }]}
          >
            <AppInput.TextArea rows={4} placeholder="What would you like us to improve?" />
          </AppForm.Item>
          <AppForm.Item>
            <AppButton htmlType="submit">Submit</AppButton>
          </AppForm.Item>
        </AppForm>
      </AppCard>

      <AppCard>
        <AppTypography variant="titleSm">Previous suggestions</AppTypography>
        <AppTypography variant="body" color="var(--app-text-secondary)">
          List view will load from the API in a follow-up.
        </AppTypography>
      </AppCard>
    </PageShell>
  );
}
