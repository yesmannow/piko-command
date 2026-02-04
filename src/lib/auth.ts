export interface OAuthCredentials {
  refreshToken?: stri
  scope?: string
  username?: string
  scope?: string
  userId?: string
  username?: string
  lastConnected?: number
 

    clientId: string
  }
    clientId: string
  }
   
  }
    clientId: string
  }

  private co

    this.redirectUri = `

    this.confi

    const platformConfig
   
    }
    const state = th
    sessionStorage.setIt
   
 

        authUrl.searchParam
        authUrl.searchParams.appe
        authUrl.searchParams.

      case 'insta
        authUrl.searchParams.append('client_id', platformConfig.c
   


        authUrl = new UR
   

        break
      case 'facebook':
    
        authUrl.searchPara
        authUrl.searchParams.append('response_type', 'code')


        authUrl.searchParams.append('c
        authUrl.searchParams.append('state', sta
        break

    }


    const storedState

      throw new Error('Invalid state parameter - possible CS

    sessionStorage.removeItem('oauth_platform')
    if (!platform) {
    }
    const platformConfig = this.config[platform as keyof AuthConfi
      throw new Error(`Platform ${platform} not configured`)


      case 'twitter':
        break
        credentials = await this.handleInstagramCallback(code, platformCo
      case 'tiktok':
        break
        credentials = await this.handleFacebookCallback(code
      case 'linkedin':
        break


  }
  private async handleTwitterCallback(
    config: { clientId: string; clientSecret: string }
    const credentials = btoa(`${config.clientId}:${config.cl
    const response = await fetch('https://api.twitter.com/2/oauth2/to
      headers: {
        'Cont

        grant_type: 'a
        code_verifier: 'challenge'
    })
    if (!response.ok) {
    }
    const data = await response.json()
    return {
      refresh


    code: string,
  ): Promise<OAuthCredentials> {
      method: 'POST',
        client_id: config.clientId,
        grant_type: 'authorization_code',
        code
    })

    }
    const data = await response.json()
    c

    const longLivedData = await longLivedResp
   

    }

    code: string,

      method: 'POST',
      body: new URLSearchParams({
     

    })
    const data = await response.json()

    }
    return {
     


    code: string,
  ): Promise<OAuthCredentials> {
    

    tokenUrl.searchParams.append('cod

    if (!response.ok) {
    }
    const data = await response.json()
    return {
      expiresAt: Date.n
  }
  private asy
    config: { client
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessT
      headers
        grant_type: 'a
        redirect_uri: this.redirectUri,
        clien
    })
    if (!response.ok) {
    }
    const data
    return {
     

  private generateState(): string {
  }



























































































































































