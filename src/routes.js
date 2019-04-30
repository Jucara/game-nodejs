import React from 'react';
import { Route, Switch } from 'react-router-dom';


import Mainboard from './mainboard';

const Routes = () => (
  <Switch>
    <Route exact path="/" component={Mainboard} />
  </Switch>
)

export default Routes
