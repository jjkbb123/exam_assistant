import React, { createRef, PureComponent } from 'react'
import { Button, Form, FormInstance, message, Radio, Select } from 'antd'
import initExam from './exam'
import './index.less';

const { Item } = Form

interface IState {
  exam: string[][],
  currentSubject: 0 | 1
}
export default class IndexPage extends PureComponent {
  state: Readonly<IState> = {
    exam: [],
    currentSubject: 0
  };
  formRef = createRef<FormInstance>()
  time: NodeJS.Timeout = setTimeout(() => { });

  componentDidMount() {
    this.initRenderExam();
  }

  initRenderExam = () => {
    const { currentSubject } = this.state;
    this.formatExam(initExam[currentSubject])
  }

  formatExam = (_initExam: { exam: string, answer: string }[]) => {
    const initRandomExamCount = Math.floor(Math.random() * _initExam.length);
    // const initRandomExamCount = 4; 
    let exam = []
    exam = _initExam[initRandomExamCount].exam.split(/\n|\t\t\t\t\t|\t\t\t\t|\t\t\t|\t\t|\t/)
    exam = exam.map((item) => item.trim().split(/\s+/)).flat(Infinity)
    console.log(exam);
    
    const answerList = _initExam[initRandomExamCount].answer;
    const examList: string[][] = []
    let examItem: string[] = []
    exam.forEach((ele, index) => {
      index++;
      examItem.push(ele)
      if (!(index % 5)) {
        examList.push(examItem)
        examItem = []
      }
    });
    answerList.split('').forEach((item, i) => {
      examList[i][5] = item
    })
    
    this.setState({
      exam: examList
    })
  }
  submit = async () => {
    const { validateFields, scrollToField } = (this.formRef.current as FormInstance)
    clearTimeout(this.time)
    validateFields()
      .then(
        val => {
          message.success("全部回答正确，五秒后开始新的题目!")
          this.time = setTimeout(() => {
            window.location.reload();
          }, 5000);
        },
        rej => {
          const errorKey = rej.errorFields[0]?.name[0]
          console.log(errorKey);
          scrollToField(errorKey)
        }
      )

  }

  render(): React.ReactNode {
    const { exam, currentSubject } = this.state;

    return (
      <div
        className="form"
      >
        <Form
          ref={this.formRef}
          validateTrigger={[]}
        >
          {
            exam.map((examItem, index) => {
              return (
                <Item 
                  key={examItem[0]}
                  name={index} label={examItem[0]}
                  rules={[
                    {
                      required: true,
                      message: ''
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (value !== examItem[5]) {
                          return Promise.reject(new Error('答案错误!'));
                        } else {
                          return Promise.resolve();
                        }
                      },
                    }),
                  ]}

                >
                  <Radio.Group>
                    {
                      examItem.map((item, i) =>
                        i && i !== 5 && <Radio key={item} value={item.split(/(\w+)./)[1]}>{item}</Radio>
                      )
                    }
                  </Radio.Group>
                </Item>
              )
            })
          }
          <Item
            style={{
              textAlign: 'center'
            }}
          >
              <Button onClick={() => this.formatExam(initExam[currentSubject])}>刷新</Button>
              <Button onClick={this.submit} type="primary">提交</Button>
          </Item>
        </Form>
        <div
          className='select-current-subject'
        >
          <Select
            style={{ width: '100%' }}
            value={currentSubject}
            onChange={(currentKey) => {
              this.setState({
                currentSubject: currentKey
              }, this.initRenderExam)
            }}
          >
            <Select.Option value={0}>软件工程</Select.Option>
            <Select.Option value={1}>中国近代史</Select.Option>
          </Select>
        </div>
      </div>
    );
  }
}
