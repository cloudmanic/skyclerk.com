<?php

namespace modules\CloudmanicCraftNginx\controllers;

use Craft;
use HttpRequest;
use craft\elements\Entry;
use craft\web\Controller;
use yii\web\Response;

class CacheController extends Controller
{
  protected $allowAnonymous = ['clear'];

  //
  // Clear Nginx Cache
  //
  public function actionClear()
  {
    if(! getenv('NGINX_CACHE_WARM_URL'))
    {
      return $this->redirect('centcom/cloudmanic-craft-nginx');
    }

    exec("rm -rf /tmp/nginx/*");
    
    // Rebuild cache
    $curl = curl_init();
    
    curl_setopt_array($curl, [
      CURLOPT_URL => getenv('NGINX_CACHE_WARM_URL'),
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => "",
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 30,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => "POST",
      CURLOPT_POSTFIELDS => "{\"token\": \"". getenv('NGINX_CACHE_WARM_KEY') . "\",\"sitemap\": \"". getenv('SITE_URL') ."/sitemap.xml\"}",
      CURLOPT_HTTPHEADER => [
        "cache-control: no-cache",
        "content-type: application/json"
      ]
    ]);
    
    $response = curl_exec($curl);
    $err = curl_error($curl);
    
    curl_close($curl);
    
    if($err) 
    {
      echo "cURL Error #:" . $err;
      die();
    }   
    
    $json = json_decode($response, true);
    
    if(! $json['status'])
    {
      return $response;
      die();
    }

    // Send notice the cache clear went well.    
    Craft::$app->getSession()->setNotice('Nginx Cache Cleared.');
    
    return $this->redirect('centcom/cloudmanic-craft-nginx');
  } 
}

/* End File */