import React, { createRef, PureComponent } from 'react'
import { Button, Form, FormInstance, message, Radio } from 'antd'
import initExam from './exam'
import './index.less';

const { Item } = Form

interface IState {
  exam: string[][]
}
export default class IndexPage extends PureComponent {
  state: Readonly<IState> = {
    exam: []
  };
  formRef = createRef<FormInstance>()
  time: NodeJS.Timeout = setTimeout(() => { });

  componentDidMount() {
    this.formatExam(initExam)
  }

  formatExam = (_initExam: { exam: string, answer: string }[]) => {
    const initRandomExamCount = Math.floor(Math.random() * _initExam.length);
    // const initRandomExamCount = 4; 
    const exam = _initExam[initRandomExamCount].exam.split(/\n|\t/)
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
    console.log(examList);
    
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
    const { exam } = this.state;

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
              <Button onClick={() => this.formatExam(initExam)}>刷新</Button>
              <Button onClick={this.submit} type="primary">提交</Button>
          </Item>
        </Form>
      </div>
    );
  }
}
