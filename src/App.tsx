import React, { MouseEvent, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import SaveIcon from '@mui/icons-material/Save'

import {
  Box,
  ButtonGroup,
  Grid,
  Button,
  Paper,
  Tooltip,
  createTheme,
  ThemeProvider,
} from '@mui/material'
import { BaseFormInput} from './formFields/baseFormInput'

import Logo from './components/Logo'
import { MoreInfoPopper } from './components/MoreInfoPopper'
import { MoreInfoContent } from './components/MoreInfoContent'
import { teal } from '@mui/material/colors'
import { theme } from './utils/react'




// TODO: render seperate react app in each subclass and pass the answer type as a generic
// but for now use any.
export const App: React.FC<{
  inputClass: BaseFormInput<any>
}> = ({ inputClass }) => {
  const [answer, setAnswer] = useState<any>(null)
  const [currentValue, setCurrentValue] = useState<any>(null)
  const [hasAnswer, setHasAnswer] = useState<boolean>(false)

  const refresh = () => {
    inputClass.hasAnswer().then((res) => setHasAnswer(res))
    inputClass.answer().then((res) => {
      setAnswer(res)
      setCurrentValue(inputClass.currentValue())
    })
  }
  useEffect(() => {
    inputClass.fill().then(() => setTimeout(refresh, 0))
    inputClass.element.addEventListener(inputClass.reactMessageEventId, refresh)

    return () => {
      inputClass.element.removeEventListener(
        inputClass.reactMessageEventId,
        refresh
      )
    }
  }, [])

  const handleSave = async () => {
    const result: boolean = await inputClass.save()
    if (result) {
      refresh()
    }
  }

  const handleFill = async () => {
    await inputClass.fill()
    refresh()
  }

  const handleDeleteAnswer = async () => {
    await inputClass.deleteAnswer()
    refresh()
  }

  return (
    <ThemeProvider theme={theme}>
      <Box my={'4px'}>
        <Grid container spacing={1} alignItems="center">
          <Grid item>
            <Logo />
          </Grid>
          <Grid item>
            <Paper elevation={4}>
              <ButtonGroup size="small">
                <Button onClick={handleFill}>Fill</Button>
                <Tooltip title="Save current value as answer.">
                  <Button onClick={handleSave}>
                    <SaveIcon />
                  </Button>
                </Tooltip>
                <MoreInfoPopper title="More Info">
                  <MoreInfoContent
                    answer={answer}
                    currentValue={currentValue}
                    handleDeleteAnswer={handleDeleteAnswer}
                    hasAnswer={hasAnswer}
                  />
                </MoreInfoPopper>
              </ButtonGroup>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  )
}

export const attachReactApp = (
  app: React.ReactNode,
  inputContainer: HTMLElement
) => {
  // cant just append the react app to the root element...
  // it makes the element disappear
  const rootElement = document.createElement('div')
  inputContainer.appendChild(rootElement)
  createRoot(rootElement).render(app)
}
