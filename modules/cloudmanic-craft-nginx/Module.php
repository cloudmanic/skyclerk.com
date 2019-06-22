<?php

//
// Date: 2018-10-18
// Author: Spicer Matthews (spicer@cloudmanic.com)
// Last Modified by: Spicer Matthews
// Last Modified: 2018-10-18
// Copyright: 2017 Cloudmanic Labs, LLC. All rights reserved.
//

namespace modules\CloudmanicCraftNginx;

use Craft;
use yii\base\Event;
use craft\web\View;
use craft\web\twig\variables\Cp;
use craft\events\RegisterCpNavItemsEvent;
use craft\events\RegisterTemplateRootsEvent;

class Module extends \yii\base\Module
{
  // 
  // Init.
  //
  public function init()
  {
    parent::init();

    // Register a new templates folder within a Module 
    Event::on(View::class, View::EVENT_REGISTER_CP_TEMPLATE_ROOTS, function(RegisterTemplateRootsEvent $e) {
      $e->roots[$this->id] = $this->getBasePath().DIRECTORY_SEPARATOR.'templates';
    });

    // Add CP navigration 
    Event::on(
      Cp::class,
      Cp::EVENT_REGISTER_CP_NAV_ITEMS,
      function(RegisterCpNavItemsEvent $event) {
        $event->navItems[] = [
          'url' => 'cloudmanic-craft-nginx',
          'label' => 'Nginx',
          'icon' => __DIR__ . '/resources/img/icon.svg',
        ];
      }
    );

  }
}

/* End File */