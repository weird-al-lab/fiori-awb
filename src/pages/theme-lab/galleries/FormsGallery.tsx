import { useState } from 'react'
import { CheckBox } from '@ui5/webcomponents-react/CheckBox'
import { ComboBox } from '@ui5/webcomponents-react/ComboBox'
import { ComboBoxItem } from '@ui5/webcomponents-react/ComboBoxItem'
import { DatePicker } from '@ui5/webcomponents-react/DatePicker'
import { DateRangePicker } from '@ui5/webcomponents-react/DateRangePicker'
import { DateTimePicker } from '@ui5/webcomponents-react/DateTimePicker'
import { FileUploader } from '@ui5/webcomponents-react/FileUploader'
import { Form } from '@ui5/webcomponents-react/Form'
import { FormGroup } from '@ui5/webcomponents-react/FormGroup'
import { FormItem } from '@ui5/webcomponents-react/FormItem'
import { Input } from '@ui5/webcomponents-react/Input'
import { Label } from '@ui5/webcomponents-react/Label'
import { MultiComboBox } from '@ui5/webcomponents-react/MultiComboBox'
import { MultiComboBoxItem } from '@ui5/webcomponents-react/MultiComboBoxItem'
import { MultiInput } from '@ui5/webcomponents-react/MultiInput'
import { Option } from '@ui5/webcomponents-react/Option'
import { RadioButton } from '@ui5/webcomponents-react/RadioButton'
import { RangeSlider } from '@ui5/webcomponents-react/RangeSlider'
import { Select } from '@ui5/webcomponents-react/Select'
import { Slider } from '@ui5/webcomponents-react/Slider'
import { StepInput } from '@ui5/webcomponents-react/StepInput'
import { Switch } from '@ui5/webcomponents-react/Switch'
import { TextArea } from '@ui5/webcomponents-react/TextArea'
import { TimePicker } from '@ui5/webcomponents-react/TimePicker'
import { Token } from '@ui5/webcomponents-react/Token'
import { Text } from '@ui5/webcomponents-react/Text'
import { DemoBlock, DemoGrid } from '../DemoBlock'
import { GalleryPanel } from '../GalleryPanel'

function DisplayField({ label, value }: { label: string; value: string }) {
  return (
    <div className="theme-lab-display-field">
      <Label showColon>{label}</Label>
      <Text>{value || '—'}</Text>
    </div>
  )
}

export function FormsGallery() {
  const [checked, setChecked] = useState(true)
  const [switched, setSwitched] = useState(false)

  return (
    <>
      <GalleryPanel title="Input / TextArea value states">
        <DemoGrid>
          <DemoBlock label="Default" wide>
            <Input placeholder="Placeholder" style={{ width: '100%' }} />
          </DemoBlock>
          <DemoBlock label="Readonly" wide>
            <Input value="Readonly value" readonly style={{ width: '100%' }} />
          </DemoBlock>
          <DemoBlock label="Disabled" wide>
            <Input value="Disabled" disabled style={{ width: '100%' }} />
          </DemoBlock>
          <DemoBlock label="Error" wide>
            <Input
              value="Invalid"
              valueState="Negative"
              style={{ width: '100%' }}
            />
          </DemoBlock>
          <DemoBlock label="Warning" wide>
            <Input
              value="Check me"
              valueState="Critical"
              style={{ width: '100%' }}
            />
          </DemoBlock>
          <DemoBlock label="Success" wide>
            <Input value="OK" valueState="Positive" style={{ width: '100%' }} />
          </DemoBlock>
          <DemoBlock label="Information" wide>
            <Input
              value="Info"
              valueState="Information"
              style={{ width: '100%' }}
            />
          </DemoBlock>
          <DemoBlock label="TextArea" wide>
            <TextArea
              placeholder="Multiline…"
              rows={3}
              style={{ width: '100%' }}
            />
          </DemoBlock>
        </DemoGrid>
      </GalleryPanel>

      <GalleryPanel title="Select / Combo / Multi">
        <DemoGrid>
          <DemoBlock label="Select" wide>
            <Select style={{ width: '100%' }}>
              <Option>Option 1</Option>
              <Option>Option 2</Option>
              <Option>Option 3</Option>
            </Select>
          </DemoBlock>
          <DemoBlock label="ComboBox" wide>
            <ComboBox placeholder="Choose…" style={{ width: '100%' }}>
              <ComboBoxItem text="Bern" />
              <ComboBoxItem text="Zürich" />
              <ComboBoxItem text="Basel" />
            </ComboBox>
          </DemoBlock>
          <DemoBlock label="MultiComboBox" wide>
            <MultiComboBox placeholder="Tags…" style={{ width: '100%' }}>
              <MultiComboBoxItem text="HR" />
              <MultiComboBoxItem text="Finance" />
              <MultiComboBoxItem text="IT" />
            </MultiComboBox>
          </DemoBlock>
          <DemoBlock label="MultiInput" wide>
            <MultiInput style={{ width: '100%' }}>
              <Token text="Token A" slot="tokens" />
              <Token text="Token B" slot="tokens" />
            </MultiInput>
          </DemoBlock>
        </DemoGrid>
      </GalleryPanel>

      <GalleryPanel title="Date / Time">
        <DemoGrid>
          <DemoBlock label="DatePicker" wide>
            <DatePicker
              style={{ width: '100%' }}
              formatPattern="dd.MM.yyyy"
              value="14.08.2026"
            />
          </DemoBlock>
          <DemoBlock label="DateRangePicker" wide>
            <DateRangePicker
              style={{ width: '100%' }}
              formatPattern="dd.MM.yyyy"
              delimiter=" - "
              value="10.08.2026 - 20.08.2026"
            />
          </DemoBlock>
          <DemoBlock label="DateTimePicker" wide>
            <DateTimePicker
              style={{ width: '100%' }}
              formatPattern="dd.MM.yyyy"
              value="14.08.2026"
            />
          </DemoBlock>
          <DemoBlock label="TimePicker" wide>
            <TimePicker style={{ width: '100%' }} />
          </DemoBlock>
        </DemoGrid>
      </GalleryPanel>

      <GalleryPanel title="Check / Radio / Switch / Slider">
        <DemoGrid>
          <DemoBlock label="CheckBox">
            <CheckBox
              text="Checked"
              checked={checked}
              onChange={() => setChecked((v) => !v)}
            />
          </DemoBlock>
          <DemoBlock label="CheckBox disabled">
            <CheckBox text="Disabled" disabled checked />
          </DemoBlock>
          <DemoBlock label="Radio">
            <div>
              <RadioButton name="tl-radio" text="A" checked />
              <RadioButton name="tl-radio" text="B" />
            </div>
          </DemoBlock>
          <DemoBlock label="Radio disabled">
            <div>
              <RadioButton name="tl-radio-dis" text="A" checked disabled />
              <RadioButton name="tl-radio-dis" text="B" disabled />
            </div>
          </DemoBlock>
          <DemoBlock label="Switch">
            <Switch
              checked={switched}
              onChange={() => setSwitched((v) => !v)}
            />
          </DemoBlock>
          <DemoBlock label="Switch disabled">
            <Switch disabled checked />
          </DemoBlock>
          <DemoBlock label="StepInput">
            <StepInput value={3} />
          </DemoBlock>
          <DemoBlock label="StepInput disabled">
            <StepInput value={3} disabled />
          </DemoBlock>
          <DemoBlock label="Slider" wide>
            <Slider min={0} max={100} value={40} showTooltip />
          </DemoBlock>
          <DemoBlock label="Slider disabled" wide>
            <Slider min={0} max={100} value={40} disabled showTooltip />
          </DemoBlock>
          <DemoBlock label="RangeSlider" wide>
            <RangeSlider min={0} max={100} startValue={20} endValue={70} />
          </DemoBlock>
          <DemoBlock label="RangeSlider disabled" wide>
            <RangeSlider
              min={0}
              max={100}
              startValue={20}
              endValue={70}
              disabled
            />
          </DemoBlock>
          <DemoBlock label="FileUploader" wide>
            <FileUploader placeholder="Choose file…" />
          </DemoBlock>
          <DemoBlock label="FileUploader disabled" wide>
            <FileUploader placeholder="Choose file…" disabled />
          </DemoBlock>
        </DemoGrid>
      </GalleryPanel>

      <GalleryPanel title="Display / summary fields (Label + Text)">
        <p className="theme-lab-note" style={{ marginTop: 0 }}>
          Fiori display mode for review/Object Page summaries — not a readonly
          Input. Uses Label + Text (same pattern as the Antrag review page). Tune{' '}
          <code>@sapContent_LabelColor</code> and <code>@sapTextColor</code>.
        </p>
        <div className="theme-lab-display-grid">
          <DisplayField label="Titel" value="CAS Digital Leadership" />
          <DisplayField label="Vom" value="01.09.2026" />
          <DisplayField label="Bis" value="30.06.2027" />
          <DisplayField label="Typ" value="CAS" />
          <DisplayField label="Anbieter" value="FHNW" />
          <DisplayField label="Leer" value="" />
        </div>
        <Form layout="S1 M2 L2 XL2" labelSpan="S12 M12 L4 XL4" style={{ marginTop: '1rem' }}>
          <FormGroup headerText="Same data in Form layout (display)">
            <FormItem labelContent={<Label>Titel</Label>}>
              <Text>CAS Digital Leadership</Text>
            </FormItem>
            <FormItem labelContent={<Label>Anbieter</Label>}>
              <Text>FHNW</Text>
            </FormItem>
          </FormGroup>
        </Form>
      </GalleryPanel>

      <GalleryPanel title="Form layout">
        <Form layout="S1 M2 L2 XL2" labelSpan="S12 M12 L4 XL4">
          <FormGroup headerText="Sample group">
            <FormItem labelContent={<Label>Name</Label>}>
              <Input style={{ width: '100%' }} />
            </FormItem>
            <FormItem labelContent={<Label>City</Label>}>
              <Input style={{ width: '100%' }} valueState="Critical" />
            </FormItem>
          </FormGroup>
        </Form>
      </GalleryPanel>
    </>
  )
}
