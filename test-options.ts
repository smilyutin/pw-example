import { T } from '@faker-js/faker/dist/airline-CLphikKp'
import {test as base} from '@playwright/test'

export type TestOptioins = {
    globalsQaURL: string
}

export const test = base.extend<TestOptioins>({
    globalsQaURL: ['', {option: true}]
})