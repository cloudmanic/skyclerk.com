<?php
/**
 * Broker Finder plugin for Craft CMS 3.x
 *
 * An easy way to figure out the prices of all options brokers.
 *
 * @link      https://cloudmanic.com
 * @copyright Copyright (c) 2017 Spicer Matthews
 */

namespace cloudmanic\nginx;


use Craft;
use craft\base\Plugin;
use craft\services\Plugins;
use craft\events\PluginEvent;
use craft\events\RegisterUrlRulesEvent;
use craft\web\UrlManager;

use craft\events\RegisterCpNavItemsEvent;
use craft\web\twig\variables\Cp;

use yii\base\Event;

//
// @author    Spicer Matthews
// @package   nginx
// @since     1.0.0
// 
class Nginx extends Plugin
{
  public static $plugin;
  public $hasCpSection = true;  
  public $hasCpSettings = false; 

  //
  // Add CP navigration 
  // It should auto call this. See vendor/craftcms/cms/src/web/twig/variables/Cp.php
  //
  public function getCpNavItem()
  {
    return [
      'url'=> 'craft-nginx',
      'label'=> \Craft::t('craft-nginx', 'Nginx')
    ];
  }

    /**
     * Set our $plugin static property to this class so that it can be accessed via
     * nginx::$plugin
     *
     * Called after the plugin class is instantiated; do any one-time initialization
     * here such as hooks and events.
     *
     * If you have a '/vendor/autoload.php' file, it will be loaded for you automatically;
     * you do not need to load it in your init() method.
     *
     */
    public function init()
    {
        parent::init();
        self::$plugin = $this;

        Craft::info('craft-nginx plugin loaded', __METHOD__);
    }
}
