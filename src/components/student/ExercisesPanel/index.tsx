import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'umi';
import { getPageQuery } from '@/utils/utils';
import { Steps, Button, Grid, Progress, Card, Typography, Collapse, List } from 'antd';
import { UpCircleFilled, DownCircleFilled } from '@ant-design/icons';
import classNames from 'classnames';
import ExerciseButton from '../ExerciseButton';
import style from './index.less';

const { useBreakpoint } = Grid;
const { Title, Paragraph } = Typography;
const { Step } = Steps;
const { Panel } = Collapse;

interface ExercisesPanelProps {
  dataSource: object;
  currentExercise?: number;
  hideDescription?: boolean;
  ghost?:boolean;
  sectionIsUnlocked?:boolean;
}

const ExercisesPanel: React.FC<ExercisesPanelProps> = (props) => {
  const { dataSource, currentExercise, hideDescription, ghost, sectionIsUnlocked } = props;
  const screens = useBreakpoint();
  const [currentSubSection, setActiveSubSection] = useState<number>(null);

  const sendToSubSections = (section_id, subsection_id) => {
    const params = getPageQuery();
    const { course_id } = params as { redirect: string };
    return `/subsection?section_id=${section_id}&course_id=${course_id}&subsection_id=${subsection_id}`;
  }

  const genExtra = (section_id: number, subsection_id: number) => (
    <Button 
    href={sendToSubSections(section_id, subsection_id)} 
    onClick={event => {event.stopPropagation()}}
    className={style.btnDetails}
    type="primary" 
    shape="round">
      <FormattedMessage
        id= 'pages.student.section.main.details.panel'
        defaultMessage= 'Details'
      />
    </Button>
  );

  const customExpandIcon = (props: {isActive: boolean}, section: number) => {
    let arrowColor = "#c8c8c8";
    if (currentSubSection && currentSubSection >= section) {
      arrowColor = "#0077cc";
    }

    if (props.isActive) {
        return <UpCircleFilled style={{fontSize: 29, color: arrowColor}}/>
    } 
    return <DownCircleFilled style={{fontSize: 29, color: arrowColor}}/>
  }

  useEffect(() => {
    if(currentExercise) {
      setActiveSubSection(currentExercise);
    }
  }, []);

  const stepsClassesCondition = classNames({
    [style.stepDataList] : true,
    [style.isMobileSize]: !screens.md,
    [style.borderless]: ghost,
  });
                   
  return (
    <>
     <Steps current={currentSubSection} direction="vertical" className={stepsClassesCondition}>
      { dataSource.map((subsection:any, index:number) => { return(
        <Step 
        // eslint-disable-next-line no-nested-ternary
        status={(subsection.progress) ? (subsection.progress === "100") ? "finish" : "process" : "wait"}
        icon={<UpCircleFilled style={{fontSize: 1, color: "#fff"}} />}
        description={
          <>
          
          { (subsection.progress !== "100") &&
          <Progress type="circle" percent={(subsection.progress) ? subsection.progress : 0} showInfo={false} width={37} />
          }

          <Collapse 
            ghost 
            defaultActiveKey={[currentSubSection]}
            expandIcon={(props) => customExpandIcon(props, index)}
          >
            <Panel 
            key={index}
            className={style.exerciseContentBox}
            header={<Title level={4} style={{display:'inline-block'}}>{subsection.subsection_name}</Title>}
            extra={genExtra(subsection.section_id, subsection.subsection_id)}
            >
            { subsection.exercises.map((exercise:any) => (
              <>
                { exercise.instructions && exercise.instructions.length > 0 &&
                <Card>
                  <div className={style.exerciseContent}>
                    <Title level={5}>
                      <FormattedMessage
                          id= 'pages.student.section.main.inst.text'
                          defaultMessage= 'Instructions'
                      />
                    </Title>
                    { (!hideDescription) &&
                    <Paragraph className={style.exerciseDescription}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Paragraph>
                    }
                  </div>
                  <div style={{textAlign: 'right', paddingLeft: 15}}>
                    <ExerciseButton 
                      exerciseId={exercise.exercise_id}
                      isUnlocked={exercise.is_unlocked}
                      requirements={exercise.requirements}
                      startedOn={exercise.started_on}
                      subSectionIsUnlocked={subsection.is_unlocked}
                      sectionIsUnlocked={sectionIsUnlocked}
                      isInstruction
                    />
                  </div>
                </Card>
                }

                <Card>
                  <div className={style.exerciseContent}>
                    <Title level={5}>{exercise.exercise_num}</Title>
                    { (!hideDescription) &&
                    <Paragraph className={style.exerciseDescription}>{exercise.description}</Paragraph>
                    }
                  </div>
                  <div style={{textAlign: 'right', paddingLeft: 15}}>
                    <ExerciseButton 
                      answeredAll={exercise.answered_all}
                      exerciseId={exercise.exercise_id}
                      score={exercise.percent_score}
                      startedOn={exercise.started_on}
                      isPassed={exercise.is_passed}
                      isRepeatable={exercise.is_repeatable}
                      isUnlocked={exercise.is_unlocked}
                      requirements={exercise.requirements}
                      subSectionIsUnlocked={subsection.is_unlocked}
                      sectionIsUnlocked={sectionIsUnlocked}
                    />
                  </div>
                </Card>
              </>
            ))}

            { /**
            <List
              itemLayout="horizontal"
              dataSource={subsection.exercises}
              renderItem={(exercise:any) => (
                <>
                  { exercise.instructions && exercise.instructions.length > 0 &&
                    <List.Item>
                      <div className={style.exerciseContent}>
                        <List.Item.Meta
                          title={<Text strong><FormattedMessage
                              id= 'pages.student.section.main.inst.text'
                              defaultMessage= 'Instructions'
                          /></Text>}
                          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                        />
                      </div>
                      <div style={{textAlign: 'right', paddingLeft: 15}}>
                        <ExerciseButton 
                          exerciseId={exercise.exercise_id}
                          isInstruction
                        />
                      </div>
                    </List.Item>
                  }
                  <List.Item className={(exercise.progress) ? 'ongoing-exercise': ''}>
                    <div className={style.exerciseContent}>
                      <List.Item.Meta
                        title={<Text strong><FormattedMessage
                          id= 'pages.student.section.main.exp'
                          defaultMessage= 'Start'
                        /> {exercise.exercise_number}</Text>}
                        description={exercise.description}
                      />
                    </div>
                    <div style={{textAlign: 'right', paddingLeft: 15}}>
                      <ExerciseButton 
                        answeredAll={exercise.answered_all}
                        exerciseId={exercise.exercise_id}
                        score={exercise.percent_score}
                        startedOn={exercise.started_on}
                        isPassed={exercise.is_passed}
                      />
                    </div>
                  </List.Item>
                </>
              )}
            />
             */}

            </Panel>
          </Collapse>
          </>
        } />
      ) }) }
    </Steps>
    </>
  )
}

export default ExercisesPanel;