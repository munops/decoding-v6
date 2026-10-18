import { Component, type ComponentChildren } from 'preact'
import type { WorkbenchLocale } from './messages'
import { completionMessages } from './completion-messages'
type Props = {
  render: () => ComponentChildren
  locale: WorkbenchLocale
  onReset?: () => void
  onClear?: () => void
}
type State = { failed: boolean; name: string; attempt: number; copied: boolean }
const errorName = (error: unknown) =>
  error instanceof Error &&
  ['Error', 'TypeError', 'RangeError', 'SyntaxError', 'ReferenceError', 'DOMException'].includes(
    error.name,
  )
    ? error.name
    : 'Error'
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { failed: false, name: 'Error', attempt: 0, copied: false }
  static override getDerivedStateFromError(error: unknown) {
    return { failed: true, name: errorName(error) }
  }
  override render() {
    const copy = completionMessages[this.props.locale]
    if (!this.state.failed) return this.props.render()
    const version =
      typeof document === 'undefined'
        ? 'unobserved'
        : (document.querySelector<HTMLMetaElement>('meta[name="application-build"]')?.content ??
          'unobserved')
    const report = `decod.ing view error\nName: ${this.state.name}\nBuild: ${/^[a-f0-9]{7,40}$/.test(version) ? version : 'unobserved'}\nDetector: unobserved\nNo input, output, stack or error message included.`
    return (
      <section class="notice danger" role="alert">
        <h2>{copy.error}</h2>
        <button
          class="button"
          type="button"
          onClick={() => {
            this.props.onReset?.()
            this.setState({ failed: false, attempt: this.state.attempt + 1, copied: false })
          }}
        >
          {copy.retry}
        </button>
        <button
          class="button secondary"
          type="button"
          onClick={() => {
            this.props.onClear?.()
            this.props.onReset?.()
            this.setState({ failed: false, attempt: this.state.attempt + 1, copied: false })
          }}
        >
          {this.props.locale === 'ko' ? '입력 지우고 새로 시작' : 'Clear input and restart'}
        </button>
        <button
          class="button secondary"
          type="button"
          onClick={() =>
            void navigator.clipboard.writeText(report).then(() => this.setState({ copied: true }))
          }
        >
          {copy.report}
        </button>
        <a
          class="button ghost"
          href={`mailto:support@munops.com?subject=decod.ing%20view%20error&body=${encodeURIComponent(report)}`}
        >
          support@munops.com
        </a>
        {this.state.copied ? (
          <p role="status">
            {this.props.locale === 'ko'
              ? '값 없는 신고문을 복사했어요.'
              : 'Value-free report copied.'}
          </p>
        ) : null}
      </section>
    )
  }
}
