#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { MyStack } from '../lib/stack';

const app = new cdk.App();
new MyStack(app, 'MyStack');
